/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import DashboardFormUI from '../views/DashboardFormUI.js'
import DashboardUI from '../views/DashboardUI.js'
import Dashboard, { filteredBills, cards } from '../containers/Dashboard.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import { bills } from '../fixtures/bills'
import router from '../app/Router'

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
      onNavigate(ROUTES_PATH.NewBill)
    })

    test('Then the letter icon in vertical menu should be hilghlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
    })

    test('Then the FormNewBill should be rendered', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeDefined()

      const expenseType = screen.getByTestId('expense-type')
      expect(expenseType).toBeDefined()

      const expenseName = screen.getByTestId('expense-name')
      expect(expenseName).toBeDefined()

      const datepicker = screen.getByTestId('datepicker')
      expect(datepicker).toBeDefined()

      const amount = screen.getByTestId('amount')
      expect(amount).toBeDefined()

      const vat = screen.getByTestId('vat')
      expect(vat).toBeDefined()

      const pct = screen.getByTestId('pct')
      expect(pct).toBeDefined()

      const commentary = screen.getByTestId('commentary')
      expect(commentary).toBeDefined()

      const file = screen.getByTestId('file')
      expect(file).toBeDefined()
    })
  })
})
describe('Given that I am on the FormNewBill view', () => {
  describe('When I fill the file input', () => {
    test.only('Then it should populate the NewBill.formData (.fileName, .file, .email)', async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = () => {}
      const newBillModel = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: null,
      })
      // FIXME: En cours, a terminer
      // const handleChangeFile = jest.fn((e) => newBillModel.handleChangeFile(e))
      // TODO:(mentor) Pas possible de remplir un champs input:file avec userEvent.type(...)
      // Il faut passer par userEvent.upload qui demande un objet File
      const file = new File(['fichier test'], 'test/hello.png', {
        type: 'image/png',
      })

      const fileInput = screen.getByTestId('file')

      await userEvent.upload(fileInput, file)
    })
  })
})

/* TODO Test à implémenter

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
        Then I should be redirect to Bills view and a new bill is present with 'pending' statuts
      
    When I fill the formNewBill incorrectley
        Then I shouldn't be able to submit the form
    
    When I fill the file input in formNewBill
        Then it should trigger the onChange
      Without sending the form
        Then it should not create a new line in Bills view
*/
