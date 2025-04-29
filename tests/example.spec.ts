import { test, expect, Page } from '@playwright/test';

const TEST_USERS = {
  admin: {
    email: 'ccc@gmail.com',
    password: '12345678'
  },
  user1: {
    email: 'cher@gmail.com',
    password: '12345678'
  }
};

const CAMP_NAME = 'East Jaystad camp';

async function login(page: Page, user: { email: any; password: any; }) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(user.email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(user.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('link', { name: 'Sign Out' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
}

// TC1-1: Create valid review
test('TC1-1: Create valid review', async ({ page }) => {
  await login(page, TEST_USERS.admin);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.locator('label').filter({ hasText: '4 Stars' }).click();
  await page.getByRole('textbox', { name: 'Tell others about your' }).click();
  await page.getByRole('textbox', { name: 'Tell others about your' }).fill('This campground is so good');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByRole('heading', { name: 'Review Submitted!' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Campground' }).click();
  await expect(page.getByText('ass as★★★★☆')).toBeVisible();
  await expect(page.getByText('This campground is so good')).toBeVisible();
  await logout(page);
});

// TC1-2: Create review with empty comment
test('TC1-2: Create review with empty comment', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.locator('label').filter({ hasText: '3 Stars' }).click();
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByRole('heading', { name: 'Review Submitted!' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Campground' }).click();
  await expect(page.getByText('Cher Lockholmes★★★☆☆')).toBeVisible();
  await logout(page);
});

// TC1-3: Attempt to create review without rating
test('TC1-3: Attempt to create review without rating', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.getByRole('textbox', { name: 'Tell others about your' }).fill('This is a test review');
  await page.getByRole('button', { name: 'Post' }).click();
  page.once('dialog', dialog => {
    expect(dialog.message()).toBe("Please add a rating");
    dialog.dismiss().catch(() => {});
  });
  await logout(page);
});

// TC1-4: Attempt to create empty review
test('TC1-4: Attempt to create empty review', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.getByRole('button', { name: 'Post' }).click();
  page.once('dialog', dialog => {
    expect(dialog.message()).toBe("Please add a rating");
    dialog.dismiss().catch(() => {});
  });
  await logout(page);
});

// TC1-5: Attempt to create review with too long comment
test('TC1-5: Attempt to create review with too long comment', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.getByRole('button', { name: 'Add your review' }).click();
  await page.locator('label').filter({ hasText: '3 Stars' }).click();
  const longText = 'a'.repeat(501);
  await page.getByRole('textbox', { name: 'Tell others about your' }).fill(longText);
  await page.getByRole('button', { name: 'Post' }).click();
  page.once('dialog', dialog => {
    expect(dialog.message()).toBe("Please do not enter more than 500 characters");
    dialog.dismiss().catch(() => {});
  });
  await logout(page);
});

// TC1-6: Display all reviews
test('TC1-6: Display all reviews', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await expect(page.getByText('ass as★★★★☆')).toBeVisible();
  await expect(page.getByText('Cher Lockholmes★★★☆☆')).toBeVisible();
  await logout(page);
});

// TC1-7: Edit review with valid changes
test('TC1-7: Edit review with valid changes', async ({ page }) => {
  await login(page, TEST_USERS.admin);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.locator('div').filter({ hasText: /^ass as★★★★☆This campground is so good/ }).locator('button[name="Edit"]').click();
  await page.getByRole('textbox').fill('This campground is so good mak mak');
  await page.locator('button:nth-child(3)').click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('ass as★★★☆☆')).toBeVisible();
  await expect(page.getByText('This campground is so good mak mak')).toBeVisible();
  await logout(page);
});

// TC1-8: Attempt to edit review without rating
test('TC1-8: Attempt to edit review without rating', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.locator('div').filter({ hasText: /^Cher Lockholmes★★★☆☆/ }).locator('button[name="Edit"]').click();
  await page.locator('.fixed > .bg-white > div > button:nth-child(2)').first().click();
  await page.locator('.fixed > .bg-white > div > button').first().click();
  await page.locator('.fixed > .bg-white > div > button:nth-child(2)').first().click();
  await page.getByRole('textbox').fill('Updated review text');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await logout(page);
});

// TC1-9: Edit review with empty comment
test('TC1-9: Edit review with empty comment', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.locator('div').filter({ hasText: /^Cher Lockholmes★★☆☆☆Updated review text/ }).locator('button[name="Edit"]').click();
  await page.locator('button:nth-child(4)').click();
  await page.getByRole('textbox').fill('');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Review updated successfully')).toBeVisible();
  await expect(page.getByText('Cher Lockholmes★★★★☆')).toBeVisible();
  await logout(page);
});

// TC1-10: Attempt to edit review with too long comment
test('TC1-10: Attempt to edit review with too long comment', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.locator('div').filter({ hasText: /^Cher Lockholmes★★★★☆/ }).locator('button[name="Edit"]').click();
  const longText = 'a'.repeat(501);
  await page.getByRole('textbox').fill(longText);
  await page.locator('button:nth-child(5)').click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Failed to update review')).toBeVisible();
  await logout(page);
});

// TC1-11: Delete own review
test('TC1-11: Delete own review', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await page.locator('div').filter({ hasText: /^Cher Lockholmes★★★★☆/ }).locator('button[name="Delete"]').click();
  await expect(page.getByRole('heading', { name: 'Are you sure you want to delete this review?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Review deleted successfully')).toBeVisible();
  await expect(page.getByText('Cher Lockholmes★★★★☆')).not.toBeVisible();
  await logout(page);
});

// TC1-12: Attempt to delete another user's review
test('TC1-12: Attempt to delete another user\'s review', async ({ page }) => {
  await login(page, TEST_USERS.user1);
  await page.getByRole('link', { name: CAMP_NAME }).click();
  await expect(page.getByText('ass as★★★☆☆').getByRole('button', { name: 'Delete' })).not.toBeVisible();
  await logout(page);
});