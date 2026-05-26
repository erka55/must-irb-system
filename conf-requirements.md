# Conference Management System Requirements

Version: 0.1
Status: Draft

---

# 1. System Overview

## Purpose
Энэхүү систем нь жил бүр зохион байгуулагддаг эрдэм шинжилгээний хурлын үйл ажиллагааг цахимаар удирдах зориулалттай.

## Goals
- Өгүүлэл хүлээн авах
- Хянан магадлах үйл явц удирдах
- Хурал зохион байгуулах
- Илтгэлийн хуваарь гаргах
- Оролцогч бүртгэх
- Тайлан, статистик гаргах

---

# 2. Actors

## Author
Өгүүлэл илгээх, төлөв харах.

## Reviewer
Өгүүлэл үнэлэх.

## Track Chair
Reviewer томилох, шийдвэр гаргах.

## Conference Admin
Системийн бүх тохиргоо удирдах.

## Participant
Хуралд бүртгүүлэх, хөтөлбөр харах.

---

# 3. Annual Conference Lifecycle

1. Conference creation
2. Call for papers
3. Submission period
4. Review period
5. Decision notification
6. Camera-ready submission
7. Registration
8. Conference event
9. Archive and reporting

---

# 4. Functional Requirements

## FR-001 Conference Management
Admin шинэ хурлын цикл үүсгэнэ.

Acceptance:
- Year
- Title
- Dates
- Submission deadline
- Review deadline

---

## FR-002 Paper Submission

Author өгүүлэл илгээнэ.

Acceptance:
- PDF upload
- Metadata
- Keywords
- Multiple authors
- Draft / final state

---

## FR-003 Reviewer Assignment

Chair reviewer томилно.

Acceptance:
- 2–3 reviewer
- Conflict detection
- Assignment history

---

## FR-004 Review Process

Reviewer үнэлгээ өгнө.

Acceptance:
- Score
- Comment
- Recommendation
- Submit deadline

---

## FR-005 Decision Making

Chair шийдвэр гаргана.

Decision:
- Accept
- Reject
- Revision

---

## FR-006 Conference Program

Accepted paper-уудаас хөтөлбөр үүсгэнэ.

Acceptance:
- Session
- Time slot
- Room
- Presenter

---

# 5. Business Rules

BR-001
Нэг reviewer өөрийн өгүүллийг review хийж болохгүй.

BR-002
Review deadline өнгөрсний дараа review submit хийхийг хориглоно.

BR-003
Conference нь жилээр тусгаарлагдсан data space байна.

---

# 6. Non-functional Requirements

## Security
- Authentication
- Role-based access
- Audit log

## Performance
- 500 concurrent users

## Availability
- 99% uptime during submission period

---

# 7. Data Entities

- Conference
- User
- Role
- Paper
- Author
- Review
- Decision
- Session
- Registration

---

# 8. Open Questions

- Blind review эсэх?
- Registration payment интеграц хэрэгтэй эсэх?
- DOI/archive хийх үү?