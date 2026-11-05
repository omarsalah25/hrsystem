const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function renderOfficialCertificate() {
  console.log('Rendering official Arabic/English HR Salary Certificate via Puppeteer...');

  const outputPath = path.resolve(__dirname, '../backend/storage/app/private/certificates/SAMPLE_CERTIFICATE_EMP_SA001.pdf');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
    body { margin: 0; padding: 40px; color: #0f172a; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .company-title h1 { margin: 0; font-size: 20px; color: #1e3a8a; }
    .company-title p { margin: 4px 0 0; font-size: 11px; color: #64748b; }
    .qr-container { text-align: center; border: 1px dashed #cbd5e1; padding: 8px; border-radius: 8px; font-size: 9px; color: #64748b; }
    .qr-box { width: 64px; height: 64px; background: #f8fafc; border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 4px; }
    .cert-title { text-align: center; margin: 30px 0; }
    .cert-title h2 { font-size: 18px; text-decoration: underline; margin: 0; color: #0f172a; }
    .cert-title p { margin: 5px 0 0; font-size: 12px; color: #475569; }
    .body-text { font-size: 13px; line-height: 2.0; text-align: justify; margin-bottom: 30px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
    .details-table th, .details-table td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: start; }
    .details-table th { background: #f8fafc; color: #334155; width: 35%; }
    .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }
    .sig-block { text-align: center; font-size: 12px; }
    .sig-space { height: 60px; border-bottom: 1px dashed #94a3b8; width: 180px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: bold; font-size: 10px; }
    .footer { position: fixed; bottom: 20px; left: 40px; right: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-title">
      <h1>مجموعة المستقبل القابضة ذ.م.م</h1>
      <p>Future Holding Group LLC | المقر الرئيسي: طريق الملك فهد، العليا، الرياض</p>
      <p>سجل تجاري: 1010892341 • الرقم الموحد: 7009812401 • الرمز البريدي: 12214</p>
    </div>
    <div class="qr-container">
      <div class="qr-box">QR CODE<br>VERIFIED</div>
      <span>وثيقة معتمدة رقمياً</span>
    </div>
  </div>

  <div class="cert-title">
    <h2>شهادة تعريف وتثبيت راتب</h2>
    <p>To Whom It May Concern / إلى من يهمه الأمر</p>
  </div>

  <div class="body-text">
    تشهد شركة <b>مجموعة المستقبل القابضة</b> بأن الموظف الموضحة بياناته أدناه يعمل لدينا ولا يزال على رأس العمل حتى تاريخ إصدار هذه الشهادة، وقد أُعطي هذا الخطاب بناءً على طلبه دون أي مسؤولية أو التزام مالي على عاتق الشركة تجاه الغير:
  </div>

  <table class="details-table">
    <tr>
      <th>اسم الموظف الثلاثي:</th>
      <td><b>عبدالله سعد العتيبي</b> (Abdullah Saad Al-Otaibi)</td>
    </tr>
    <tr>
      <th>الجنسية ورقم الهوية الوطنية:</th>
      <td>سعودي الجنسية • هوية رقم: <b>1098765432</b></td>
    </tr>
    <tr>
      <th>الرقم الوظيفي والمسمى:</th>
      <td>EMP-SA-001 • <b>Senior Software Engineer</b></td>
    </tr>
    <tr>
      <th>تاريخ مباشرة العمل:</th>
      <td>15 يناير 2023 م (15/01/2023)</td>
    </tr>
    <tr>
      <th>الراتب الأساسي الشهري:</th>
      <td>18,000.00 ريال سعودي</td>
    </tr>
    <tr>
      <th>بدل السكن والمواصلات:</th>
      <td>6,000.00 ريال سعودي</td>
    </tr>
    <tr>
      <th>إجمالي الراتب الشامل:</th>
      <td><b style="color: #1d4ed8; font-size: 14px;">24,000.00 ريال سعودي شهرياً</b></td>
    </tr>
  </table>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-space">معتمد إلكترونياً بالتوقيع الرقمي</div>
      <b>إدارة الموارد البشرية والعمليات</b>
      <p style="margin: 2px 0; font-size: 10px; color: #64748b;">Future Group HR Dept.</p>
    </div>
    <div class="sig-block">
      <div class="sig-space">ختم المنشأة الرسمي المعتمد</div>
      <b>الختم المؤسسي للمنشأة</b>
      <p style="margin: 2px 0; font-size: 10px; color: #64748b;">Seal & Compliance</p>
    </div>
  </div>

  <div class="footer">
    رمز التحقق الأمني: DOC-CERT-2026-SA001 • يمكن التحقق من صحة وصلاحية هذا الخطاب عبر مسح كود QR أو زيارة https://hrsystem.com/verify-doc
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
  });

  await browser.close();
  console.log('Official Certificate rendered successfully to:', outputPath);
}

renderOfficialCertificate().catch(err => {
  console.error('Failed to render certificate:', err);
  process.exit(1);
});

