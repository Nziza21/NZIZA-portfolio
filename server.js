const fetch = require('node-fetch');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const mailToNziza = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New message from ${name} — nziza.tech`,
    html: `
      <h2>New Portfolio Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  const mailToSender = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Hey ${name}, Nziza got your message!`,
    html: `
      <h2>Thanks for reaching out!</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>I received your message and will get back to you soon.</p>
      <br/>
      <p>— Nziza Samuel</p>
      <p><a href="https://nziza.tech">nziza.tech</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailToNziza);
    await transporter.sendMail(mailToSender);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

app.get('/backdrop', async (req, res) => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    const movies = data.results.filter(m => m.backdrop_path);
    const random = movies[Math.floor(Math.random() * movies.length)];
    const imageUrl = `https://image.tmdb.org/t/p/original${random.backdrop_path}`;

    const imgRes = await fetch(imageUrl);
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.buffer();

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    console.error('TMDB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});