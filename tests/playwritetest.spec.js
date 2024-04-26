// @ts-check
const { test, expect} = require('@playwright/test');

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:3000/third.html';

// Go to the website home page before each test.
test.beforeEach(async ({ page }) => {
    await page.goto(websiteURL);
 });

 // add a vehicle with missing details
test('add a vehicle missing data', async ({page}) => {
    await page.locator('#rego').fill('LKJ23UO')
    await page.locator('#model').fill('Taycan')
    await page.locator('#colour').fill('white')
    await page.getByRole('button', { name: 'Add vehicle' }).click();

    await expect(page.locator('#message')).toContainText('Error')
 })

 // add a vehicle add person missing data
test('add a person missng data', async ({page}) => {
    await page.locator('#rego').fill('LKJ23U')
    await page.locator('#make').fill('Porsche')
    await page.locator('#model').fill('Taycan')
    await page.locator('#colour').fill('white')
    await page.locator('#owner').fill('Kai')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
    // add a new person
    await page.locator('#personid').fill('6')
    await page.locator('#name').fill('Kai')
    await page.locator('#dob').fill('1990-01-01')
    await page.locator('#license').fill('SD876ES')
    await page.locator('#expire').fill('2030-01-01')
    await page.getByRole('button', { name: 'Add owner' }).click();
 
    await expect(page.locator('#message')).toContainText('Error')
 })


 // add a vehicle (missing owner)
test('Test adding a number plate already in', async ({page}) => {
    await page.getByRole('link', { name: 'Add a vehicle' }).click();
    await page.locator('#rego').fill('KWK24JI')
    await page.locator('#make').fill('Porsche')
    await page.locator('#model').fill('Taycan')
    await page.locator('#colour').fill('white')
    await page.locator('#owner').fill('Kai')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
    // add a new person
    await page.locator('#personid').fill('6')
    await page.locator('#name').fill('Kai')
    await page.locator('#address').fill('Edinburgh')
    await page.locator('#dob').fill('1990-01-01')
    await page.locator('#license').fill('SD876ES')
    await page.locator('#expire').fill('2030-01-01')
    await page.getByRole('button', { name: 'Add owner' }).click();
 
    await expect(page.locator('#message')).toContainText('Vehicle added successfully')
 
    await page.getByRole('link', { name: 'People search' }).click();
    await page.locator('#name').fill('Kai')
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('#results')).toContainText('SD876ES')
    await expect(page.locator('#results').locator('div')).toHaveCount(1)
 })