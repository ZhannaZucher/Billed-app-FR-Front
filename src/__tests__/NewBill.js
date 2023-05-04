/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom"
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
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage, })
      const testFile = new File(["validProof"], "validProof.jpg", { type: "image/jpg" })
      const fileInput = screen.getByTestId("file")

      const mockHandleChangeFIle = jest.fn((e) => newBill.handleChangeFile(e))

      fileInput.addEventListener("change", mockHandleChangeFIle)
      fireEvent.change(fileInput, { target: { files: [testFile] } })

      expect(mockHandleChangeFIle).toHaveBeenCalled()
      expect(fileInput.files[0]).toStrictEqual(testFile)
    })
  })

  //Integration test POST
  describe("When I click on Submit button after filling in correctly all required inputs", () => {
    test("The NewBill should be created and I should be redirected on the Bills page", async() => {
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage, })

      const testBill = {
        type: "Transport",
        name: "TGV Paris Tlse",
        date: "2023-04-27",
        amount: 40,
        vat: 60,
        pct: 20,
        commentary: "commentary",
        fileUrl: "../img/ticket.jpg",
        fileName: "ticket.jpg",
        status: "pending",
      };
      screen.getAllByTestId("expense-type").value = testBill.type
      screen.getAllByTestId("expense-name").value = testBill.name
      screen.getAllByTestId("datepicker").value = testBill.date
      screen.getAllByTestId("amount").value = testBill.amount
      screen.getAllByTestId("vat").value = testBill.vat
      screen.getAllByTestId("pct").value = testBill.pct
      screen.getAllByTestId("commentary").value = testBill.commentary
      newBill.fileName = testBill.fileName
      newBill.fileUrl = testBill.fileUrl

      const form = screen.getByTestId("form-new-bill")
      newBill.updateBill = jest.fn()
      const mockHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", mockHandleSubmit)
      fireEvent.submit(form)

      expect(mockHandleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()

      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeVisible()
    })

    test("the fetch to an API fails with 500 message error", async () => {
      //tracking calls to object'mockstore', returns a mock function bills()
      jest.spyOn(mockStore, "bills")
      //tracking console.error
      jest.spyOn(console, 'error').mockImplementation(() => { })

      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
      router()

      const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage, })
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      const form = screen.getByTestId("form-new-bill")
      const mockHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", mockHandleSubmit)
      fireEvent.submit(form)

      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })
})