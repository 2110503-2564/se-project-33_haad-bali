import { test, expect } from '@playwright/test';

// Test case: Create Review
test('create review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('ccc@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.locator('label').filter({ hasText: '4 Stars' }).click();
  await page.getByRole('textbox', { name: 'Tell others about your' }).fill('good as posiblee');
  await page.getByRole('button', { name: 'Post' }).click();

  // Check if the review submission is successful
  await expect(page.locator('h3')).toContainText('Review Submitted!');
  
  await page.getByRole('button', { name: 'Back to Campground' }).click();
});

// Test case: Edit Review
test('edit review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('ccc@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.locator('div').filter({ hasText: /^ass as★★★★☆good as posiblee/ }).getByRole('button').first().click();
  
  await page.locator('button:nth-child(5)').click();  // Assuming the edit button is at nth-child(5)
  await page.getByRole('textbox').fill('good as posiblecads');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  
  // Check if the review update is successful
  await expect(page.getByRole('main')).toContainText('Review updated successfully');
  
  await page.locator('div').filter({ hasText: /^ass as★★★★★good as posiblecads/ }).getByRole('button').nth(1).click();
});

// Test case: Delete Review
test('delete review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('ccc@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.locator('div').filter({ hasText: /^ass as★★★★★good as posiblecads4/ }).getByRole('button').nth(1).click();
  await expect(page.locator('h3')).toContainText('Are you sure you want to delete this review?');

  await page.getByRole('button', { name: 'Delete' }).click();

  // Check if the review deletion is successful
  await expect(page.getByRole('main')).toContainText('Review deleted successfully');
});

// Test case: Create Review (User)
test('user create review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('petchpeerawich@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.locator('label').filter({ hasText: '5 Stars' }).click();
  await page.getByRole('textbox', { name: 'Tell others about your' }).fill('Amazing place to relax!');
  await page.getByRole('button', { name: 'Post' }).click();

  // Check if the review submission is successful
  await expect(page.locator('h3')).toContainText('Review Submitted!');
  
  await page.getByRole('button', { name: 'Back to Campground' }).click();
});

// Test case: Edit Review (User)
test('user edit review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('petchpeerawich@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.locator('div').filter({ hasText: /^peerawich praesakulcharoenkit★★★★★Amazing place to relax!/ }).getByRole('button').first().click();
  
  await page.locator('button:nth-child(5)').click();  // Assuming the edit button is at nth-child(5)
  await page.getByRole('textbox').fill('Absolutely loved the atmosphere here!');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  
  // Check if the review update is successful
  await expect(page.getByRole('main')).toContainText('Review updated successfully');
  
  await page.locator('div').filter({ hasText: /^peerawich praesakulcharoenkit★★★★★Absolutely loved the atmosphere here!/ }).getByRole('button').nth(1).click();
});

// Test case: Delete Review (User)
test('user delete review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill('petchpeerawich@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  await page.getByRole('link', { name: 'camp1 camp1 Rate this' }).click();
  await page.locator('div').filter({ hasText: /^peerawich praesakulcharoenkit★★★★★Absolutely loved the atmosphere here!/ }).getByRole('button').nth(1).click();
  await expect(page.locator('h3')).toContainText('Are you sure you want to delete this review?');

  await page.getByRole('button', { name: 'Delete' }).click();

  // Check if the review deletion is successful
  await expect(page.getByRole('main')).toContainText('Review deleted successfully');
});