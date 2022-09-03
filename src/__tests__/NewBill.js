/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import mockStore from '../__mocks__/store'
import router from '../app/Router'

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
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

    test('Then the FormNewBill should be rendered with all the input field', async () => {
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

describe('Given I am on the NewBillForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    )

    document.body.innerHTML = NewBillUI()
  })

  describe('When I trigger handleSubmit', () => {
    test('Then it should trigger updateBill and onNavigate', async () => {
      const mockEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      }
      mockEvent.target.querySelector.mockReturnValue('test value')

      const onNavigate = () => {}
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })

      const spyOnNavigate = jest.fn()
      const spyUpdateBill = jest.fn()

      newBillContainer.onNavigate = spyOnNavigate
      newBillContainer.updateBill = spyUpdateBill

      await newBillContainer.handleSubmit(mockEvent)

      expect(spyOnNavigate).toHaveBeenCalled()
      expect(spyUpdateBill).toHaveBeenCalled()
    })

    // Integration POST: submit new bill
    describe('When I click to submit form', () => {
      test('Then it should trigger the updateBill fct to update(POST) API and then it should redirect me to the Bills view', () => {
        const mockEvent = {
          target: { querySelector: jest.fn() },
          preventDefault: jest.fn(),
        }

        mockEvent.target.querySelector.mockReturnValue('test value')

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBillContainer = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        })

        const spyUpdate = jest.spyOn(newBillContainer, 'updateBill')

        // Mock handleSubmit to be able to use the mockEvent
        const handleSubmit = jest.fn(() =>
          newBillContainer.handleSubmit(mockEvent)
        )

        const sendBtn = screen.getByText('Envoyer')
        sendBtn.addEventListener('click', handleSubmit)
        userEvent.click(sendBtn)

        expect(handleSubmit).toHaveBeenCalled()
        expect(spyUpdate).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })

  describe('When handleFileChange is triggered', () => {
    describe('As expected', () => {
      test('Then it should call bills fn from store and change billId, fileUrl and fileName ', async () => {
        const billsSpy = jest.spyOn(mockStore, 'bills')
        const onNavigate = () => {}

        const newBillContainer = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        })

        const mockEvent = {}
        mockEvent.preventDefault = jest.fn()
        mockEvent.target = { value: 'OK.png' }

        const fileInput = screen.getByTestId('file')
        const file = new File(['test'], 'test.png', { type: 'image/png' })
        await userEvent.upload(fileInput, file)

        await newBillContainer.handleChangeFile(mockEvent)

        expect(billsSpy).toHaveBeenCalled()

        expect(newBillContainer.billId).not.toBeNull()
        expect(newBillContainer.fileUrl).not.toBeNull()
        expect(newBillContainer.fileName).not.toBeNull()
      })
    })

    describe('With a wrong extension', () => {
      test('Then it should not call for a bill creation via store', async () => {
        const billsSpy = jest.spyOn(mockStore, 'bills')

        const onNavigate = () => {}

        const newBillContainer = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        })
        const mockEvent = {}
        mockEvent.preventDefault = jest.fn()
        mockEvent.target = { value: 'NOK.txt' }

        const fileInput = screen.getByTestId('file')
        const file = new File(['test'], 'test.txt', { type: 'plain/txt' })
        await userEvent.upload(fileInput, file)

        await newBillContainer.handleChangeFile(mockEvent)

        expect(billsSpy).not.toHaveBeenCalled()
      })
    })
  })

  // Integration POST a new file
  describe('When I load a file in the file input', () => {
    test('Then it should POST to the API (trigger create fct in store)', async () => {
      const onNavigate = () => {}

      jest.spyOn(mockStore, 'bills')

      const spyCreate = jest.fn(() => {
        return Promise.resolve({})
      })

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: spyCreate,
        }
      })

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })

      const mockEvent = {}
      mockEvent.preventDefault = jest.fn()
      mockEvent.target = { value: 'OK.png' }

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      await userEvent.upload(fileInput, file)

      await newBillContainer.handleChangeFile(mockEvent)

      expect(spyCreate).toHaveBeenCalled()
    })
  })
})
