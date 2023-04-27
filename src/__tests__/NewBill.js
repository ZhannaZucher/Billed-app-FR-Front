/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
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
    //setup the router
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

  describe("When I upload the proof file with the wrong format(other than .jpg, .jpeg, .png)", () => {
    test("It should not attach the file", () => {
      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      const invalidFile = new File(["invalidProof"], "invalidProof.png", { type: "document/pdf" })
      const fileInput = screen.getByTestId("file")

      const mockHandleChangeFIle = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", mockHandleChangeFIle)
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      expect(mockHandleChangeFIle).toHaveBeenCalled()
      expect(fileInput.value).toBe("")
    })
  })

  describe("When I upload the proof file with the correct format(.jpg, .jpeg or .png)", () => {
    test("It should update the input field", () => {
      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      const testFile = new File(["validProof"], "validProof.jpg", { type: "image/jpg" })
      const fileInput = screen.getByTestId("file")

      const mockHandleChangeFIle = jest.fn((e) => newBill.handleChangeFile(e))

      fileInput.addEventListener("change", mockHandleChangeFIle)
      fireEvent.change(fileInput, { target: { files: [testFile] } })

      expect(mockHandleChangeFIle).toHaveBeenCalled()
      expect(fileInput.files[0]).toStrictEqual(testFile)
    })
  })

  describe("When I click on Submit button after filling in correctly all required inputs", () => {
    test("The NewBill should be created and I should be redirected on the Bills page", () => {
      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      screen.getAllByTestId("expense-type").value = "Transports"
      screen.getAllByTestId("expense-name").value = "TGV Paris-Tlse"
      screen.getAllByTestId("datepicker").value = "2001-01-01"
      screen.getAllByTestId("amount").value = "80"
      screen.getAllByTestId("vat").value = "60"
      screen.getAllByTestId("pct").value = "20"
      screen.getAllByTestId("commentary").value = "formation Talend"
      const testFile = new File(["proof"], "proof.png", {type: "image/png"})
      const fileInput = screen.getByTestId("file")
      userEvent.upload(fileInput, testFile)
      // Make sure the action was successful
      expect(fileInput.files.length).toBe(1)
      expect(fileInput.files[0]).toStrictEqual(testFile)

      const form = screen.getByTestId("form-new-bill")
      const mockHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", mockHandleSubmit)
      fireEvent.submit(form)

      expect(mockHandleSubmit).toHaveBeenCalled()
      expect(screen.getByText("Mes notes de frais")).toBeVisible()
    })
  })
})