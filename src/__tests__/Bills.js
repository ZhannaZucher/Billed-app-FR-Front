/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
import { ROUTES } from "../constants/routes.js"

// mock navigation
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

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
      //to-do write expect expression
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
      //test here line 14 and 20
      //window.onNavigate(ROUTES_PATH.Bills)
      
      const bill = new Bills ({document, onNavigate, localStorage: window.localStorage,})
      const btnNewBill = screen.getByTestId("btn-new-bill")
      const mockHandleClickNewBill = jest.fn(bill.handleClickNewBill)
      mockHandleClickNewBill(btnNewBill)
      userEvent.click(btnNewBill)

      expect(mockHandleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()


    })

    test("Then the function  'HandleCLickIconEye' should be called", () => {
      //test here line 14
    })
    test("Then the modal 'New Bill' should be visible", () => {
      //test here line 24-27


    })
  })
})
