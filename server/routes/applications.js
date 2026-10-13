const express = require('express');
const router = express.Router();
const db = require('../db');

// Хүсэлтийн дугаараар хайх API (/api/applications/:code)
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    const searchCode = code.trim().toUpperCase();

    const result = await db.query(
      'SELECT * FROM applications WHERE UPPER(application_no) = $1',
      [searchCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ийм дугаартай хүсэлт олдсонгүй.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Хайхад гарсан алдаа:', err);
    res.status(500).json({ error: 'Сервер дээр алдаа гарлаа: ' + err.message });
  }
});

// Шинэ хүсэлт бүртгэх API (/api/applications)
router.post('/', async (req, res) => {
  const { title, summary, methodology, reviewLevel } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Судалгааны сэдвийн нэр заавал шаардлагатай.' });
  }

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM applications');
    const nextNumber = parseInt(countResult.rows[0].count) + 1;
    const appCode = `IRB-2026-${String(nextNumber).padStart(3, '0')}`;

    const userResult = await db.query('SELECT id FROM users LIMIT 1');
    const firstUserId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

    // NOT NULL багануудын хамгаалалт
    const finalSummary = summary || title;
    const finalMethodology = methodology || 'Тодорхойлоогүй';

    // ENUM утгуудын шалгалт (EXEMPTED, EXPEDITED, FULL_BOARD)
    const validLevels = ['EXEMPTED', 'EXPEDITED', 'FULL_BOARD'];
    const finalReviewLevel = validLevels.includes(reviewLevel) ? reviewLevel : 'EXEMPTED';

    const newApp = await db.query(
      `INSERT INTO applications (
        application_no, 
        title, 
        summary, 
        methodology, 
        researcher_id, 
        review_level, 
        status
      )
       VALUES ($1, $2, $3, $4, $5, $6, 'SUBMITTED')
       RETURNING *`,
      [appCode, title, finalSummary, finalMethodology, firstUserId, finalReviewLevel]
    );

    res.status(201).json({
      message: 'Хүсэлт амжилттай бүртгэгдлээ.',
      application: newApp.rows[0],
    });
  } catch (err) {
    console.error('Хүсэлт хадгалах үеийн бодит алдаа:', err);
    res.status(500).json({ error: 'Хүсэлт хадгалахад алдаа гарлаа: ' + err.message });
  }
});

module.exports = router;
