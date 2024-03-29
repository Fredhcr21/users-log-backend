import { Config } from '../../config';
import url from 'url';
import ejs from 'ejs';
import { logger } from '../../core';

// eslint-disable-next-line
export default async function renderView(template: string, data: any, _layout: string): Promise<string> {
  try {
    // Render the template view to generate rhe body of the view
    const emailHtml = await ejs.renderFile(__dirname + `/../../../views/${template}.ejs`, {
      ...data,
      url,
      config: Config,
    });
    // Render the layout view injecting the body previously generated
    const layoutHtml = await ejs.renderFile(__dirname + `/../../../views/layouts/layout-email.ejs`, {
      body: emailHtml,
      fromEmailAddress: Config.email.fromEmailAddress,
      supportEmaiil: Config.custom.supportEmail,
      url,
      config: Config,
    });
    return layoutHtml;
  } catch (err) {
    // @ts-ignore
    logger.error(`Error when tying to render the HTML view: ${err.message}`);
    throw err;
  }
}
