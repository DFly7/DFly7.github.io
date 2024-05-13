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
    await page.locator('#rego').fill('FFZ4356')
    await page.locator('#model').fill('Ford')
    await page.locator('#colour').fill('GT')
    await page.getByRole('button', { name: 'Add vehicle' }).click();

    await expect(page.locator('#message')).toContainText('Error')
 })

 // add a vehicle add person missing data
test('add a person missng data', async ({page}) => {
    await page.locator('#rego').fill('FFZ1234')
    await page.locator('#make').fill('Bugatii')
    await page.locator('#model').fill('Veron')
    await page.locator('#colour').fill('Red')
    await page.locator('#owner').fill('Darragh')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
    // add a new person
    await page.locator('#personid').fill('10')
    await page.locator('#name').fill('Darragh')
    await page.locator('#dob').fill('1990-01-01')
    await page.locator('#license').fill('SD876ES')
    await page.locator('#expire').fill('2030-01-01')
    await page.getByRole('button', { name: 'Add owner' }).click();
 
    await expect(page.locator('#message')).toContainText('Error')

    //check vehicle wasnt added
    await page.getByRole('link', { name: 'Vehicle search' }).click();

    await page.locator('#rego').fill('FFZ1234')
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('#message')).toContainText('No result found')


 })


 // add a vehicle Vehicle ID already in DB
test('Test adding a number plate already in', async ({page}) => {
    await page.locator('#rego').fill('KWK24JI')
    await page.locator('#make').fill('Porsche')
    await page.locator('#model').fill('911')
    await page.locator('#colour').fill('Red')
    await page.locator('#owner').fill('Flynn')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
    await expect(page.locator('#message')).toContainText('Error')
 })


  // add a person duplicate person id
test('Duplicate person id', async ({page}) => {
    await page.locator('#rego').fill('DRZ12345')
    await page.locator('#make').fill('Bugati')
    await page.locator('#model').fill('911')
    await page.locator('#colour').fill('Red')
    await page.locator('#owner').fill('Joe Joe')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
   // add a new person
   await page.locator('#personid').fill('1')
   await page.locator('#name').fill('Joe Joe')
   await page.locator('#address').fill('DUBLIN')
   await page.locator('#dob').fill('2012-02-30')
   await page.locator('#license').fill('SD876ES')
   await page.locator('#expire').fill('2030-01-01')
   await page.getByRole('button', { name: 'Add owner' }).click();

   await expect(page.locator('#message')).toContainText('Error')

   await page.getByRole('link', { name: 'Vehicle search' }).click();

   await page.locator('#rego').fill('DRZ12345')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#message')).toContainText('No result found')
})


// add a vehicle Owner in DB already then seacrh the vehicle and check for owner
test('Owner In DB Check Vehicle Search Output for Owner', async ({page}) => {
    await page.locator('#rego').fill('1234567')
    await page.locator('#make').fill('Car')
    await page.locator('#model').fill('fast')
    await page.locator('#colour').fill('white')
    await page.locator('#owner').fill('Rachel Smith')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 
    await expect(page.locator('#message')).toContainText('Vehicle added successfully');

    await page.getByRole('link', { name: 'Vehicle search' }).click();

    await page.locator('#rego').fill('1234567')
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('#results')).toContainText('Rachel Smith')
    await expect(page.locator('#message')).toContainText('Search successful')
 })

 // add a vehicle Owner not in db check vehicle added has owner in db using vehicle seacrh
test('add V Owner not in db', async ({page}) => {
    await page.locator('#rego').fill('DarraghCar7')
    await page.locator('#make').fill('Car')
    await page.locator('#model').fill('fast')
    await page.locator('#colour').fill('white')
    await page.locator('#owner').fill('Darragh Flynn')
    await page.getByRole('button', { name: 'Add vehicle' }).click();
 

    await page.locator('#personid').fill('12')
    await page.locator('#name').fill('Darragh Flynn')
    await page.locator('#address').fill('Belfast')
    await page.locator('#dob').fill('2003-01-01')
    await page.locator('#license').fill('1234567')
    await page.locator('#expire').fill('2030-01-01')
    await page.getByRole('button', { name: 'Add owner' }).click();
 
    await expect(page.locator('#message')).toContainText('Vehicle added successfully')

    await page.getByRole('link', { name: 'Vehicle search' }).click();
 
    await page.locator('#rego').fill('DarraghCar7')
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('#results')).toContainText('Darragh Flynn')
    await expect(page.locator('#message')).toContainText('Search successful')
 })