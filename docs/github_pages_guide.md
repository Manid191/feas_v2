# วิธีนำเว็บขึ้น GitHub Pages (แบบละเอียด)

วิธีนี้เหมาะสำหรับทุกคน ไม่จำเป็นต้องใช้ Command Line (จอดำๆ) ก็ทำได้ครับ

---

## ขั้นตอนที่ 1: เตรียมโค้ดให้พร้อม
ตรวจสอบว่าคุณมีไฟล์เหล่านี้อยู่ในโฟลเดอร์เดียวกัน:
*   `index.html` (ต้องชื่อนี้เท่านั้น ห้ามชื่ออื่น)
*   `style.css`
*   `app.js`
*   `input_manager.js`, `calculator.js`, `report_manager.js` (และไฟล์ .js อื่นๆ)

---

## ขั้นตอนที่ 2: สร้างพื้นที่เก็บงาน (Repository)
1.  ไปที่เว็บ [github.com](https://github.com) แล้ว Log in
2.  ที่มุมขวาบน กดเครื่องหมาย **+** แล้วเลือก **New repository**
    *   **Repository name:** ตั้งชื่อภาษาอังกฤษ (เช่น `power-plant-calculator`)
    *   **Public:** เลือกเป็น Public (เพื่อให้คนอื่นเข้าใช้เว็บได้)
    *   **Initialize this repository with a README:** (ไม่ต้องติ๊ก ก็ได้)
3.  กดปุ่ม **Create repository** สีเขียวด้านล่าง

---

## ขั้นตอนที่ 3: อัปโหลดไฟล์ (แบบ Drag & Drop)
เมื่อสร้างเสร็จ คุณจะเจอหน้ารอรับโค้ด ให้มองหาประโยค:
> "…or create a new repository on the command line"  
> **"…or upload an existing file"** (ให้กดลิงก์นี้)

1.  กดลิงก์ **upload an existing file**
2.  เปิดโฟลเดอร์งานในเครื่องคอมพิวเตอร์ของคุณ
3.  **ลากไฟล์ทั้งหมด** (index.html, .js, .css) ลงไปวางในกรอบสี่เหลี่ยมในหน้าเว็บ
    *   *รอจนแถบโหลดสีเขียวครบทุกไฟล์ (`index.html` ต้องมาด้วย)*
4.  เลื่อนลงมาข้างล่าง ตรงกล่อง **Commit changes**
    *   กดปุ่ม **Commit changes** สีเขียว

---

## ขั้นตอนที่ 4: เปิดใช้งานเว็บไซต์ (Pages)
1.  เมื่ออัปโหลดเสร็จ ให้มองหาแถบเมนูข้างบน (Code, Issues, Pull requests...) ให้กดที่ **Settings** (รูปฟันเฟือง ขวาสุด)
2.  เมนูด้านซ้ายมือ ให้เลื่อนลงมาหาคำว่า **Pages** (ล่างๆ หน่อย)
3.  ที่หัวข้อ **Build and deployment** > **Source**:
    *   เลือกเป็น `Deploy from a branch`
4.  ที่หัวข้อ **Branch**:
    *   ช่องแรกเลือก `main` (หรือ `master`)
    *   ช่องถัดมาเลือก `/ (root)`
    *   กดปุ่ม **Save**

---

## ขั้นตอนที่ 5: รอรับลิงก์
1.  หลังจากกด Save ให้รอประมาณ 1-2 นาที (GitHub กำลังสร้างเว็บให้คุณ)
2.  ลองกด Refresh หน้าเดิม (หน้า Settings > Pages)
3.  คุณจะเห็นแถบด้านบนเขียนว่า:
    > **"Your site is live at..."**
    > (เช่น `https://yourname.github.io/power-plant-calculator/`)

**เสร็จสิ้น!** คุณสามารถก๊อปปี้ลิงก์นั้นไปให้เพื่อนลองใช้ได้เลยครับ
