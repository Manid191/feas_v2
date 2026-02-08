# วิธีการนำโปรแกรมขึ้นใช้งานออนไลน์ (Deployment Guide)

โปรแกรมนี้เป็น **Static Web Application** (HTML, CSS, JavaScript) ซึ่งดูแลง่ายและสามารถนำขึ้นเซิร์ฟเวอร์ฟรีได้หลายวิธีครับ

นี่คือวิธีที่ง่ายและนิยมที่สุด 2 วิธี:

---

## วิธีที่ 1: Netlify Drop (ง่ายที่สุด - ลากวางจบเลย)
เหมาะสำหรับ: คนที่ไม่ต้องการใช้ Git หรือ Command Line

1.  **เตรียมไฟล์:**
    *   ตรวจสอบว่าไฟล์ทั้งหมด (`index.html`, `style.css`, `app.js`, ฯลฯ) อยู่ในโฟลเดอร์เดียวกัน (เช่นโฟลเดอร์ `power_plant_feasibility`).
2.  **ไปที่เว็บ Netlify:**
    *   เข้าเว็บไซต์ [app.netlify.com/drop](https://app.netlify.com/drop)
3.  **อัปโหลด:**
    *   ลากโฟลเดอร์โปรเจกต์ของคุณไปวางในช่อง **"Drag and drop your site output folder here"**.
4.  **เสร็จสิ้น:**
    *   รอสักครู่ Netlify จะสร้างลิงก์ (URL) ให้คุณทันที (เช่น `https://funny-name-1234.netlify.app`).
    *   คุณสามารถส่งลิงก์นี้ให้คนอื่นใช้งานได้เลย

---

## วิธีที่ 2: GitHub Pages (สำหรับการพัฒนาต่อเนื่อง)
เหมาะสำหรับ: คนที่ใช้ GitHub เป็นประจำ และต้องการอัปเดตโค้ดอัตโนมัติ

1.  **สร้าง Repository:**
    *   สร้าง Repository ใหม่ใน GitHub
2.  **อัปโหลดโค้ด:**
    *   Push ไฟล์ทั้งหมดขึ้นไปที่ Repository นั้น
3.  **ตั้งค่า Pages:**
    *   ไปที่ tab **Settings** ของ Repository
    *   เลือกเมนู **Pages** (เมนูด้านซ้าย)
    *   ที่หัวข้อ **Build and deployment** > **Source**, เลือก `Deploy from a branch`
    *   เลือก Branch เป็น `main` (หรือ `master`) และ folder เป็น `/ (root)`
    *   กด **Save**
4.  **รอสักครู่:**
    *   GitHub จะใช้เวลา 1-2 นาที ในการสร้างเว็บ (จะมีลิงก์ปรากฏด้านบน เช่น `https://username.github.io/repo-name/`).

    *   GitHub จะใช้เวลา 1-2 นาที ในการสร้างเว็บ (จะมีลิงก์ปรากฏด้านบน เช่น `https://username.github.io/repo-name/`).

---

## วิธีที่ 3: Vercel (เร็วและเสถียรมาก)
คล้ายกับ Netlify แต่เป็นอีกค่ายที่นิยมมาก

1.  สมัครสมาชิกที่ [vercel.com](https://vercel.com)
2.  ติดตั้ง **Vercel CLI** (หรือเชื่อมต่อผ่าน GitHub)
3.  **แบบ Drag & Drop:**
    *   ถ้าไม่อยากใช้คำสั่ง สามารถ Import Project จาก GitHub ได้เลย เพียงแค่กด "Add New Project" ในหน้า Dashboard ของ Vercel แล้วเลือก Repository ที่เราสร้างไว้ใน GitHub

---

## วิธีที่ 4: Web Hosting ทั่วไป (FTP / DirectAdmin / cPanel)
ถ้าคุณมีเช่า Hosting ไว้อยู่แล้ว (เช่น Godaddy, Hostinger, หรือโฮสต์ไทยต่างๆ)

1.  **เตรียมไฟล์:**
    *   รวมไฟล์ทั้งหมด (`index.html`, `style.css`, `app.js`, ฯลฯ)
2.  **เชื่อมต่อ FTP:**
    *   ใช้โปรแกรม FileZilla หรือ File Manager ในหน้าจัดการโฮสต์
3.  **อัปโหลด:**
    *   อัปโหลดไฟล์ทั้งหมดไปที่โฟลเดอร์ `public_html` (หรือโฟลเดอร์ย่อยที่ต้องการ)
4.  **ใช้งาน:**
    *   เข้าเว็บผ่านโดเมนของคุณได้เลย (`www.your-domain.com`)

---

## วิธีที่ 5: รันจำลองบนเครื่องตัวเอง (Local Web Server)
ถ้าแค่ต้องการรันเทสบนเครื่องให้เหมือนออนไลน์ (แก้ปัญหา CORS หรือไฟล์ CSV)

**ถ้ามี Python (ติดตั้งง่ายสุด):**
1.  เปิด Command Promt / Terminal ในโฟลเดอร์โปรเจกต์
2.  พิมพ์คำสั่ง: `python -m http.server`
3.  เข้าผ่าน Browser: `http://localhost:8000`

**ถ้ามี Node.js:**
1.  ติดตั้ง: `npm install -g http-server`
2.  รันคำสั่ง: `http-server`
3.  เข้าผ่าน Browser ตาม Port ที่แจ้ง

---
*   **การเชื่อมต่ออินเทอร์เน็ต:** โปรแกรมนี้มีการเรียกใช้กราฟ (`Chart.js`) ผ่าน CDN ดังนั้นเครื่องที่เปิดใช้งานจำเป็นต้องต่ออินเทอร์เน็ตถึงจะเห็นกราฟครับ
*   **ข้อมูลส่วนตัว:** ข้อมูลที่กรอก (Inputs) จะถูกบันทึกใน Browser ของผู้ใช้แต่ละคน (Local Storage) **ไม่ได้ถูกส่งมาที่ Server กลาง** ดังนั้นข้อมูลโปรเจกต์จะปลอดภัยและเป็นส่วนตัวครับ
