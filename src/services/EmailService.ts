import { Resend } from "resend"

const resend = new Resend(`${process.env.RESEND_API_KEY}`)

interface EmailData {
    to: string | string[],
    cc?: string | string[],
    bcc?: string | string[],
    subject: string,
    body: string
    filename: string
    attachment: Buffer
    replyTo?: string
}
export const sendEmailWithAttachmentService = async({attachment, body, to, filename, subject, bcc, cc, replyTo}: EmailData): Promise<void> => {
    const {data , error } = await resend.emails.send({
        from: 'Capital Humano < capitalhumano@devarana.mx >',
        to: to,
        cc: cc,
        bcc: bcc,
        subject,
        replyTo,
        html: body,
        attachments: [
            {
                filename,
                content: attachment.toString('base64'),
            }
        ]
    })

    if(error) {
        throw new Error(error.message)
    }
    
}