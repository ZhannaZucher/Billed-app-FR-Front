/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store.js"

//jest.mock("../app/Store", () => mockStore)

// mock navigation
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    //tests configuration
    beforeEach(() => {
      //we mock the connection as an employee in the local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //creation of new node
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      //initializing BillsUI
      document.body.innerHTML = BillsUI({ data: bills })
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on the button 'New Bill'", () => {
    test("Then I should be redirected to the page 'New Bill'", () => {
      //test here lines 14 and 20     
      const bill = new Bills ({document, onNavigate, localStorage: window.localStorage,})
      const mockHandleClickNewBill = jest.fn((e) => bill.handleClickNewBill())
      const btnNewBill = screen.getByTestId("btn-new-bill")
      btnNewBill.addEventListener("click", mockHandleClickNewBill)
      userEvent.click(btnNewBill)

      expect(mockHandleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  describe("When I click on the IconEye of a bill", () => {
    test("Then the bill proof should be visible", () => {
      //test here lines 24-27
      document.body.innerHTML = BillsUI({ data: bills })
      //mock the jQuery modal plugin to simulate a function
      $.fn.modal = jest.fn()
      const bill = new Bills({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      const mockHandleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon))
      const iconEye = screen.getAllByTestId("icon-eye")
      iconEye.forEach((icon) => {
        icon.addEventListener("click", mockHandleClickIconEye(icon))
        userEvent.click(icon)
      })
      expect(mockHandleClickIconEye).toHaveBeenCalled()
      expect(screen.getAllByText("Justificatif")).toBeTruthy()        
    })
  })
})

//Integration test GET
describe("GIven I am a user connected as a employee", () => {
  describe("When I navigate to Bills page", () => {
    test("it fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()

      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage, })
      const mockGetBills = jest.fn(() => bills.getBills())
      const mockedData = await mockGetBills()
      expect(mockGetBills).toHaveBeenCalled()
      expect(mockedData.length).toBe(4)
    })
  })

  describe("When an error occurs on API", () => {

    beforeEach(() => {
      //tracking calls to object'mockstore', returns a mock function bills()
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email:"a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    afterEach(() => {
      // restore the spy created with spyOn
      jest.restoreAllMocks()
    })

    test("fetching bills from an API fails with 404 message error", async () => {

    })

    test("fetching bills from an API fails with 500 message error", async () => {

    })
  })
})