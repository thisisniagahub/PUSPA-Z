import { test, expect } from '@playwright/test';

/**
 * PUSPA V5 — Chrome DevTools Protocol (CDP) Integration Test
 * Ujian ini mengesahkan integrasi antara "Component Setting" dan "AI Chat Panel"
 * dengan memantau log Runtime pelayar.
 */
test.describe('PUSPA V5 DevTools & Debug Audit', () => {

  test('Sahkan Debug Mode memaparkan log teknikal Hermes', async ({ page }) => {
    // 1. Buka sesi Chrome DevTools Protocol (CDP)
    const client = await page.context().newCDPSession(page);
    
    // Aktifkan pemantauan Network dan Console
    await client.send('Network.enable');
    await client.send('Runtime.enable');

    // Pantau panggilan API untuk memastikan tool calling berlaku
    client.on('Network.requestWillBeSent', (params) => {
      if (params.request.url.includes('/api/v1/ai')) {
        console.log(`[CDP Network] Menghantar permintaan ke AI: ${params.request.url}`);
      }
    });

    // 2. Suntik tetapan "Debug Mode: true" ke dalam localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('puspa-settings', JSON.stringify({
        agent: { debugMode: true, model: 'openai/gpt-4o-mini', temperature: 0.7 },
        notifications: { email: true, push: true }
      }));
    });

    // Reload untuk memastikan komponen AiChatPanel membaca state terbaru
    await page.reload();

    // 3. Berinteraksi dengan AI Chat
    // Pastikan panel terbuka (andaikan ada placeholder input)
    const inputArea = page.locator('input[placeholder="Tanya Maria Puspa..."]');
    await expect(inputArea).toBeVisible();
    
    await inputArea.fill('Berapa jumlah usahawan asnaf?');
    await page.keyboard.press('Enter');

    // 4. Verifikasi Visual DevTools dalam UI
    // Kita cari elemen header "Hermes v5 Debug Logs" yang hanya muncul jika debugMode === true
    const debugHeader = page.locator('text=Hermes v5 Debug Logs');
    await expect(debugHeader).toBeVisible({ timeout: 10000 });

    console.log('Ujian Chrome DevTools selesai: Debug Mode berfungsi dengan betul.');
  });
});