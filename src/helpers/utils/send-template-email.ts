/**
 * Send an email using a template.
 *
 * To ease testing and development, if the provided "to" email address ends in "@example.com",
 * then the email message will be written to the terminal instead of actually being sent.
 *
 * @param template
 * The relative path to an EJS template within our `views/emails/` folder -- WITHOUT the file extension.
 *
 * @param templateData
 * A dictionary of data wich will be accessible in the EJS template.
 * Each key will be a local variable accessible in the template. For instance, if you supply
 * a dictionary with a \`friends/` key, and \`friends\` is an array like \`[{name: "Chandra"}, {name: "Mary"}]\`),
 * then you will be able to access \`friends\` from the template.
 *
 * @param To
 * The email address of the primary recipient.
 * If this is any address ending in "@example.com", then don't actually deliver the message.
 * Instead, just log it to the console.
 *
 * @param subject
 * The subject email.
 *
 * @param layout
 * Set to `false` to disable layouts altogether, or provide the path (relative
 * form `views/layout/`) to an override email layout.
 */

import { startsWith } from 'ramda';
import path from 'path';
import nodemailer from 'nodemailer';
import { logger } from '../../core';
import { Helpers } from '..';
import { Config } from '../../config';

interface EmailInput {
  template: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateData: any;
  to: string;
  subject: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layout?: any;
}

export default async function sendTemplateEmail({
  template,
  templateData,
  to,
  subject = '',
  layout,
}: EmailInput): Promise<{ loggedInsteadOfSending: boolean }> {
  if (!startsWith('email-', path.basename(template))) {
    logger.warn(
      `The "template" that was passed in to \`utils.sendTemplateEmail()\` doesn't begin with 
        "email-" -- but by convention, all email template files in \`views/emails/\` should 
        be namesspaced in this way. (This makes it easier to look up email templates by 
        filename; e.h. when using CMD/CTRL+P in Sublime Text.)
        Continuing regardless...`,
    );
  }

  if (startsWith('views/', template) || startsWith('emails/', template)) {
    throw new Error(
      `The "template" that was passed in to \`utils.sendTemplateEmail()\` was prefixed with
        \`emails/\` or \`views/\` -- but that part is supposed to be ommited. Instead, please
        jsut specify the path to the desired email template relative form \`views/emails/\`.
        For example: 
            template: 'email-reset-password'
        Or: 
            template: 'admin/email-contact-form'`,
    );
  } //•
  // Determine appropriate email layout and template to use.
  const emailTemplatePath = path.join('emails/', template);
  if (layout) {
    layout = path.relative(path.dirname(emailTemplatePath), path.resolve('layouts/', layout));
  } else {
    layout = false;
  }

  // Compile HTML template.
  // > Note that we set the layout, provide access to core `url` package (for
  // > building links and image srcs, etc.). and alse provide access to core
  // > `util` package (for dumping debug data in internal emails).
  const htmlEmailContents = await Helpers.utils.renderView(emailTemplatePath, templateData, layout);

  /** Sometimes only log info to the console about the email that WOULD have been sent.
   * Specifically, if the "To" email address is anything "@example.com".
   *
   * > This used below when determining wheter to actually send the email,
   * > for convinience during development, but also for safety. (For example,
   * > a special-cased version of "user@example.com" is used by Trend Micro Mars
   * > scanner to "check apks for malware".)
   */
  const isToAddressConsideredFake = Boolean(to.match(/@example\.com$/i));

  // If that's the case, or ig we're in the "test" environment, then log
  // the email instead of sending it:
  if (Config.app.env === 'test' || isToAddressConsideredFake) {
    logger.debug(
      `Skipped sending email, either because the "To" email address ended in "@example.com"
        or because the current \`Config.environment\` is set to "test"
        
        But anyway, here is what WOULD have been sent: 
        -=-=-=-=-=-=-=-=-=-=-=-=-= Email log =-=-=-=-=-=-=-=-=-=-=-=-
        To: ${to}
        Subject: ${subject}
        
        Body: ${htmlEmailContents}
        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-`,
    );
  } else {
    // Otherwise, we'll check what all required SMTP credentials are set up
    // and, if so, continue to actually send the email.

    if (!Config.email.host || !Config.email.port || !Config.email.auth.user || !Config.email.auth.pass) {
      throw new Error(
        `Cannot deliver email to "${to}" because: 
            ` +
          ((): string => {
            const problems = [];
            if (!Config.email.host) {
              problems.push(" • SMTP host is missing from this app's configuration (`Config.email.host`)");
            }
            if (!Config.email.port) {
              problems.push(" • SMTP port is missing from this app's configuration (`Config.email.port`)");
            }
            if (!Config.email.auth.user) {
              problems.push(" • SMTP user is missing from this app's configuration (`Config.email.auth.user`)");
            }
            if (!Config.email.auth.pass) {
              problems.push(" • SMTP password is missing from this app's configuration (`Config.email.auth.pass`)");
            }
            return problems.join('\n');
          })() +
          `

            To resolve these configuration issues, add the SMTP missing config variables to
            \`config/email.ts\`-- or in staging/production, set them up as system
            environment vars.
            
            > Note that, for convenience during development, there is another alternative:
            > In lieu of setting up real SMTP credentials, you can "fake" email
            > delivery by using any email address that ends in "@example.com".  This will
            > write automated emails to your logs rather than actually sending them.
            > (To simulate clicking on a link from an email, just copy and paste the link
            > from the terminal output into your browser.)`,
      );
    }
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: Config.email.host,
      port: Config.email.port,
      secure: Config.email.secure, // true for 465, false for other ports
      auth: {
        user: Config.email.auth.user, // generated ethereal user
        pass: Config.email.auth.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: Config.email.fromEmail, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: htmlEmailContents, // html body
    });
    logger.debug(`Email send: ${JSON.stringify(info)}`);
  }

  // All done!
  return {
    loggedInsteadOfSending: isToAddressConsideredFake,
  };
}
