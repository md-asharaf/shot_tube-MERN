import { Resend } from "resend";

const RESEND_DOMAIN = process.env.RESEND_DOMAIN;
const API_KEY = process.env.RESEND_API_KEY;

const resend = new Resend(API_KEY);

export const sendEmail = async (to, subject, Text) => {
    const { error } = await resend.emails.send({
        to,
        from: `noreply@${RESEND_DOMAIN}`,
        subject,
        text: Text
    })
    return { error }
}