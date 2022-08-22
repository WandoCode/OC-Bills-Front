/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then ...', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
    })
  })
})

/* TODO Test

Given I am connected as employee
    When I am on NewBill page
        Then letter icon in vertical menu should be hilghlighted
        Then newBillForm should be rendered (vérifier chaque champ obligatoire)
      With the page loading
        Then it should render the loading page
      With an error sent by API
        Then it should render the error page
    
    When I fill the formNewBill correctley
        Then I should be able to submit the form (check values of final 'bill')
      
    When I fill the formNewBill incorrectley
        Then I shouldn't be able to submit the form
    
    When I fill the file input in formNewBill
      Without sending the form
        Then it should not create a new line in Bills view
*/
