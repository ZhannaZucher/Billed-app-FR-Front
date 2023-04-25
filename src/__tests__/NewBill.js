/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

// mock navigation
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  //tests configuration
  beforeEach(() => {
    //mock the connection as an employee in the local storage
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: "Employee"
    }))
    //creation of new node
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    //initializing NewBillUI
    window.onNavigate(ROUTES_PATH.NewBill)
  })

  describe("When I am on NewBill Page", () => {
    test("Then I should see the NewBill form with its inputs and Submit button", () => {
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

  describe("When I click on Submit button without filling in required inputs", () => {
    test("It should render the NewBill form page", () => {

      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      //required form inputs are empty
      const dateInput = screen.getByTestId("datepicker")
      expect(dateInput.value).toBe("")
      expect(dateInput).toBeRequired()
      const amountInput = screen.getByTestId("amount")
      expect(amountInput.value).toBe("")
      expect(amountInput).toBeRequired()
      const pctInput = screen.getByTestId("pct")
      expect(pctInput.value).toBe("")
      expect(pctInput).toBeRequired()
      const fileInput = screen.getByTestId("file")
      expect(fileInput.value).toBe("")
      expect(fileInput).toBeRequired()

      const form = screen.getByTestId("form-new-bill")
      const mockHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", mockHandleSubmit)
      fireEvent.submit(form)

      expect(mockHandleSubmit).toHaveBeenCalled()
      expect(form).toBeTruthy()
      //expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      //expect(screen.getByText("Envoyer une note de frais")).toBeVisible()
    })
  })

  describe("When I upload the proof file with the wrong format", () => {
    test("It should display an error message", () => {
      // test here
    })
  })

  describe("When I click on Submit button after filling in correctly all required inputs", () => {
    test("The NewBill should be created and I should be redirected on the Bills page", () => {
      // test here
    })
  })
})


