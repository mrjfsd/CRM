const pug = require('pug');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
let pdf = require('html-pdf');
const { listAllSettings, loadSettings } = require('@/middlewares/settings');
const { getData } = require('@/middlewares/serverData');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

exports.generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  result,
  callback
) => {
  try {
    const { targetLocation } = info;

    // if PDF already exists, then delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // render pdf html

    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compile Pug template

      const settings = await loadSettings();
      const selectedLang = settings['idurar_app_language'];
      const translate = useLanguage({ selectedLang });

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      // Compute an absolute file:// URL for the bundled fonts directory so
      // PhantomJS can load Arimo (Arial-compatible) on any OS without relying
      // on system-installed fonts (which differ between Windows dev and Linux prod).
      const fontsDir = path.resolve('src/public/fonts');
      const fontBase = require('url').pathToFileURL(fontsDir).href;

      // ── PDF FONT DIAGNOSTIC ─────────────────────────────────────────────────
      // These lines log to the backend terminal so production can be compared
      // to localhost. Check your server logs after generating a PDF.
      console.log('[PDF-DIAG] platform   :', process.platform);
      console.log('[PDF-DIAG] cwd        :', process.cwd());
      console.log('[PDF-DIAG] fontsDir   :', fontsDir);
      console.log('[PDF-DIAG] fontBase   :', fontBase);
      console.log('[PDF-DIAG] Arimo-Regular exists:', fs.existsSync(path.join(fontsDir, 'Arimo-Regular.ttf')));
      console.log('[PDF-DIAG] Arimo-Bold    exists:', fs.existsSync(path.join(fontsDir, 'Arimo-Bold.ttf')));
      // ────────────────────────────────────────────────────────────────────────

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
        fontBase,
      });

      pdf
        .create(htmlContent, {
          format: info.format,
          orientation: 'portrait',
          border: '10mm',
          // Allow PhantomJS to read file:// URLs so it can load the bundled
          // Arimo font files from src/public/fonts/ on the production server.
          localUrlAccess: true,
        })
        .toFile(targetLocation, function (error) {
          if (error) throw new Error(error);
          if (callback) callback();
        });
    }
  } catch (error) {
    throw new Error(error);
  }
};
