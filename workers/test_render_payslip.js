const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function renderSamplePayslip() {
  console.log('Rendering official bilingual PDF payslip via Puppeteer...');

  const outputPath = path.resolve(__dirname, '../backend/storage/app/private/payslips/SAMPLE_PAYSLIP_EMP_SA001.pdf');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
    body { margin: 0; padding: 24px; color: #0f172a; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
    .logo-area h1 { margin: 0; font-size: 18px; color: #1e3a8a; }
    .logo-area p { margin: 2px 0 0; font-size: 11px; color: #64748b; }
    .badge { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 8px; font-weight: bold; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; }
    .card-title { font-weight: bold; color: #334155; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .table-container { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f1f5f9; padding: 8px; text-align: start; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    .net-banner { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .net-amount { font-size: 20px; font-weight: 900; color: #1d4ed8; }
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; color: #64748b; }
    .qr-box { width: 48px; height: 48px; border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>مجموعة المستقبل القابضة | Future Holding Group</h1>
      <p>سجل تجاري: 1010892341 • الرقم الضريبي: 300123456700003 • فرع العليا، الرياض</p>
    </div>
    <div class="badge">قسيمة راتب شهرية (Payslip)</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">بيانات الموظف التعاقدية (Employee Info)</div>
      <div class="row"><span>اسم الموظف:</span> <b>عبدالله سعد العتيبي</b></div>
      <div class="row"><span>الرقم الوظيفي:</span> <b>EMP-SA-001</b></div>
      <div class="row"><span>المسمى الوظيفي:</span> <b>Senior Software Engineer</b></div>
      <div class="row"><span>القسم:</span> <b>تقنية المعلومات (IT)</b></div>
    </div>
    <div class="card">
      <div class="card-title">بيانات الصرف والبنك (Banking Details)</div>
      <div class="row"><span>فترة الراتب:</span> <b>01-11-2026 إلى 30-11-2026</b></div>
      <div class="row"><span>اسم البنك:</span> <b>مصرف الراجحي (Al Rajhi Bank)</b></div>
      <div class="row"><span>الآيبان (IBAN):</span> <b dir="ltr">SA0380000000608010167519</b></div>
      <div class="row"><span>نظام الامتثال:</span> <b>حماية الأجور (WPS) & التأمينات (GOSI)</b></div>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>المستحقات والبدلات (Earnings)</th>
          <th>المبلغ (SAR)</th>
          <th>الاستقطاعات النظامية (Deductions)</th>
          <th>المبلغ (SAR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>الراتب الأساسي (Basic Salary)</td>
          <td><b>18,000.00</b></td>
          <td>التأمينات الاجتماعية (GOSI Employee 9.75%)</td>
          <td style="color: #dc2626;"><b>-2,193.75</b></td>
        </tr>
        <tr>
          <td>بدل السكن (Housing Allowance)</td>
          <td><b>4,500.00</b></td>
          <td>خصم غياب أو تأخير</td>
          <td><b>0.00</b></td>
        </tr>
        <tr>
          <td>بدل المواصلات (Transport Allowance)</td>
          <td><b>1,500.00</b></td>
          <td>سلف واستقطاعات أخرى</td>
          <td><b>0.00</b></td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td>إجمالي المستحقات (Gross Salary)</td>
          <td>24,000.00 SAR</td>
          <td>إجمالي الاستقطاعات (Total Deductions)</td>
          <td style="color: #dc2626;">-2,193.75 SAR</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="net-banner">
    <div>
      <div style="font-size: 11px; color: #475569;">صافي الراتب المحول للحساب البنكي (Net Salary Transferred)</div>
      <div style="font-size: 10px; color: #64748b;">(فقط واحد وعشرون ألفاً وثمانمائة وستة ريالات سعودية و 25 هللة لا غير)</div>
    </div>
    <div class="net-amount">21,806.25 SAR</div>
  </div>

  <div class="footer">
    <div>
      <p style="margin: 0;">وثيقة رسمية صادرة إلكترونياً ومشفرة طبقاً للمادة 90 من نظام العمل السعودي.</p>
      <p style="margin: 2px 0 0; font-family: monospace;">HASH: 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72</p>
    </div>
    <div class="qr-box">
      QR CODE<br>VERIFIED
    </div>
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
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });

  await browser.close();
  console.log('PDF successfully rendered and saved to:', outputPath);
}

renderSamplePayslip().catch(err => {
  console.error('Error rendering payslip:', err);
  process.exit(1);
});
