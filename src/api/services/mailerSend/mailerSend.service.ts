import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { UserJSON } from "src/models/users/users.model";
const mailerSend = new MailerSend({
  apiKey:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNmJjMzRiN2E4YWJhNmY3NGVkMDM2MGY1NDEyNWJkNjFlZTFlMWQ5NzhmN2E4NDIzYjgxMDRlZmQ3NmMyNjgxYTA0MmYxNmRmZTU0MGYxNmIiLCJpYXQiOjE2Nzg5MzI4MDEuMDI1OTgyLCJuYmYiOjE2Nzg5MzI4MDEuMDI1OTg0LCJleHAiOjQ4MzQ2MDY0MDEuMDIxNzI1LCJzdWIiOiI1NzM4OSIsInNjb3BlcyI6WyJlbWFpbF9mdWxsIiwiZG9tYWluc19mdWxsIiwiYWN0aXZpdHlfZnVsbCIsImFuYWx5dGljc19mdWxsIiwidG9rZW5zX2Z1bGwiLCJ3ZWJob29rc19mdWxsIiwidGVtcGxhdGVzX2Z1bGwiLCJzdXBwcmVzc2lvbnNfZnVsbCIsInNtc19mdWxsIiwiZW1haWxfdmVyaWZpY2F0aW9uX2Z1bGwiLCJpbmJvdW5kc19mdWxsIiwicmVjaXBpZW50c19mdWxsIiwic2VuZGVyX2lkZW50aXR5X2Z1bGwiXX0.iOX4vIOX9NIkk7gOte69pKfbjdNHFsbPeVaafYAVVT2E5cCU_8W3tD0wulR1tIlgDwD3aMPbMEfJv7ZhjaoTw3hTh4WD6xkCNBY3XxsN5qAMtdJSgGeJkirlDcmWxHAejSqcbNTdNgAXPGYKDuRSaJDkEuC8ms5Y6ru5P5b_KzndUJaKsaGzIBecqNY4tCAXLLRi8y56ttVKKCkUIomXbO164CtcBR_LgSIKPUDVgHDVZHLQZgDhKjjr_Zp-h4AEWQO6MTdVXJbYE4D-Zss2Z4hiqXRgkqVFb8SvOCoxJEeHsPpUqfxB2jRgLsChshnMUBwx4W0JBvYb4j_YPKYfhe2glPIKy31ekugSbSgHCNcXel7rbvV6xIKUqw6S6aGQP5hQoUvaRJVYMT6ZsiLgKLJyyaWg6N-dF2BEOvFapPqQTKHDV64pFBVC8EXnDhOkz6ZrSw-kFpBEdy0rwEk2Uh93RngeIYy8Fu7uRjFgS31gg1h36F0UiJeylQw1Gj8LFgReaKaSlhSCzguHI0xIW_H41a9HwI8EjCKV8j7dCrCHnlTMC68iTf5crJWvkVimML4jQNiLS5F3Ouw25MkKwQTbJ0MgVNtEag-LmRwL6v0D_yGbXbHTFMb_W3JAefH6xLe7JPmhOQM9C8-AZFxl8ZzDfwqCs6El1Ib9xGplFpM",
});
const sentFrom = new Sender("info@teamgroundapp.com", "TeamGround");

class Mail {
  async sendMail(): Promise<any> {

    const recipients = [
      new Recipient("sergiman94@gmail.com", "Sergio Manrique"),
    ];

    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("This is a Subject Test")
    .setTemplateId('vywj2lpo0dk47oqz');

    return await mailerSend.email.send(emailParams)
  }

  async sendConfirmationEmail(user: UserJSON): Promise<any> {
    const recipients = [new Recipient(user.email, user.username)];

    const variables = [
      {
        email: user.email,
        substitutions: [
          {
            var: "account.name",
            value: user.username,
          },
          {
            var: "account.key",
            value: user.key,
          },
          {
            var: "support_email",
            value: "TeamGround",
          },
        ],
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Confirma tu correo electronico")
      .setTemplateId("3z0vkloqdw747qrx")
      .setVariables(variables);

    return await mailerSend.email.send(emailParams);
  }

  async sendResetPasswordEmail(user: UserJSON): Promise<any> {
    const recipients = [new Recipient(user.email, user.username)];

    const variables = [
      {
        email: user.email,
        substitutions: [
          {
            var: "account.name",
            value: user.username,
          },
          {
            var: "account.key",
            value: user.key,
          },
          {
            var: "support_email",
            value: "TeamGround",
          },
        ],
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Restablecer contraseña")
      .setTemplateId("0r83ql32dqv4zw1j")
      .setVariables(variables);

    return await mailerSend.email.send(emailParams);
  }

  async sendSignUpEmail(user: UserJSON): Promise<any> {
    const recipients = [new Recipient(user.email, user.username)];
    const variables = [
      {
        email: user.email,
        substitutions: [
          {
            var: "account.name",
            value: user.username,
          },
          {
            var: "account.key",
            value: user.key,
          },
          {
            var: "support_email",
            value: "TeamGround",
          },
        ],
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Bienvenido a TeamGround")
      .setTemplateId("vywj2lpo0dk47oqz")
      .setVariables(variables);

    return await mailerSend.email.send(emailParams);

  }
}

const mail = new Mail();
export default mail;
