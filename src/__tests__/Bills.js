/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'

import router from '../app/Router.js'
import Bills from '../containers/Bills.js'

describe('Given I am connected as an employee', () => {
  describe('When I click on the New Bill button', () => {
    test('Then I should render the New Bill form', async () => {
      // Affiche l'ecran employee
      document.body.innerHTML = BillsUI({ data: bills })
      // Mime le comportement de window.onNavigate dans Router.js (avec juste ce qui est intéressant pour le test)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Ajoute la logique à BillsUI
      new Bills({ document, onNavigate })
      // Mime un clic sur le btn 'nouvelle note de frais'
      const btnNewBill = screen.getByTestId('btn-new-bill')
      fireEvent.click(btnNewBill)
      // Vérifie que le formulaire s'est ouvert
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy()
    })
  })
})
