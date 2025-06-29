// File: controllers/contactController.js
const nodemailer = require('nodemailer');

/**
 * Регулярка для простой проверки email
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendContactForm(req, res) {
  try {
    const { name,surname, email, message,phone } = req.body;

    // 1) Проверяем, что все поля переданы
    if (!name || !surname || !email || !message || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 2) Проверяем формат email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Incorrect email.' });
    }

    // 3) Настраиваем Nodemailer (берём данные из .env)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4) Собираем письмо
    const mailOptions = {
      from: `"${name}" "${surname}" <${email}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `New message (Contact Us): ${name} ${surname}`,
      // text: `Name: ${name}\nEmail: ${email}\nnEmail: ${email}\n\nMessage:\n${message}`,
      text:
      `First Name: ${name}\n` +
      `Last Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n\n` +     
      `Message:\n${message}`
    };

    // 5) Отправляем письмо
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'The letter has been sent successfully.' });
  } catch (err) {
    console.error('Ошибка в sendContactForm:', err);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
}

module.exports = {
  sendContactForm,
};
