/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'

import router from '../app/Router.js'

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )

      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // to-do write expect expression => Done
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })

    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('Then a bill row should display the bill s type, name, date, amount, status and the eye icon', () => {
      document.body.innerHTML = BillsUI({ data: [bills[0]] })

      const typeCell = screen.getByText(bills[0].type)
      const nameCell = screen.getByText(bills[0].name)
      const dateCell = screen.getByText(bills[0].date)
      const amountCell = screen.getByText(bills[0].amount + ' €')
      const statusCell = screen.getByText(bills[0].status)

      expect(typeCell).toBeTruthy()
      expect(nameCell).toBeTruthy()
      expect(dateCell).toBeTruthy()
      expect(amountCell).toBeTruthy()
      expect(statusCell).toBeTruthy()
    })
  })

  describe('When I am on Bills page but page is loading', () => {
    test('then it should render Loading page', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end return an error message', () => {
    test('then it should render Loading page', () => {
      document.body.innerHTML = BillsUI({ error: 'error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})
