/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

// mock navigation
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    //tests configuration
    beforeEach(() => {
      //we mock the connection as an employee in the local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Setup the router.
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      //initializing NewBillUI
      document.body.innerHTML = NewBillUI()
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
    })

    test("Then I should see the NewBill form with inputs and Submit button", () => {
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getAllByTestId("expense-type")).toBeTruthy()
      expect(screen.getAllByTestId("expense-name")).toBeTruthy()
      expect(screen.getAllByTestId("datepicker")).toBeTruthy()
      expect(screen.getAllByTestId("amount")).toBeTruthy()
      expect(screen.getAllByTestId("vat")).toBeTruthy()
      expect(screen.getAllByTestId("pct")).toBeTruthy()
      expect(screen.getAllByTestId("commentary")).toBeTruthy()
      expect(screen.getAllByTestId("file")).toBeTruthy()
      expect(screen.getAllByText("Envoyer")).toBeTruthy()
    })
  })
})

