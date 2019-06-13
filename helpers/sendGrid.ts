require('dotenv').config()
import * as fs from 'fs';

import * as sendGridMail from '@sendgrid/mail';
import * as Handlebars from 'handlebars';
import { promisify } from 'util';
import * as azureStorage from 'azure-storage';

const blobService = azureStorage.createBlobService(process.env.AzureStorageConnectionString);
const getBlobToTextAsync = promisify(blobService.getBlobToText).bind(blobService);
const blobStorageTemplateContainer = process.env.BlobStorageTemplateContainer;

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
export async function sendEmail(data: any) {
    
    const templateHtml = await getBlobToTextAsync(blobStorageTemplateContainer, 'sandbox/emailTemplate.html');
    const template = Handlebars.compile(templateHtml);
    const emailHtml = template(data);
    try {
        let email = data.contactInfo.emails.filter((x: any) => x.isMainEmail === true);
        email = JSON.stringify(email[0].address).replace(/['"]+/g, '');
        
        const msg = {
            to: email,
            from: 'contato@allinvestx.com',
            subject: 'Sending with Twilio SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: emailHtml,
        }
        
        await sendGridMail.send(msg);
    } catch (error) {
        console.log('error', error)
    }
}
