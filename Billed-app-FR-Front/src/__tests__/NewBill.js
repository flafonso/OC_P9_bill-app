/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, fireEvent, getByTestId} from "@testing-library/dom"
// import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js"

// import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
jest.mock("../app/Store.js", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then icon-mail in vertical layout should be highlighted", async () => {
      // Set local storage with user type and email
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@test.com"
      }))

      // Create a div with id root and append it to the body to be able to initialise the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      // Navigate to the bills page
      window.onNavigate(ROUTES_PATH.NewBill)

      // Find the mail icon and check if it has the "active-icon" class
      const mailIcon = screen.getByTestId("icon-mail")
      expect(mailIcon).toHaveClass("active-icon")
    })

    describe("When I upload a right file", () => {
      test("Then it should detect that a file has been loaded and keep its data", () => {
        // Set up onNavigate function
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))

        // Initialize NewBill
        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

        let fileInput = screen.getByTestId("file")

        // Mock handleChangeFile function and add event on input file element
        const handleChangeFile = jest.fn((e) => newBillObj.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFile)

        // Create a test file (which is an image) and simulate file input change with the test file
        const testFile = new File(new Uint8Array(4), "testFile.jpeg", { type : "image/jpeg"})
        fireEvent.change(fileInput, {target : {files : [testFile]}})

        // Verify that the handleChangeFile function was called
        expect(handleChangeFile).toHaveBeenCalled()

        // Check if the error message is hidden
        const errorMsg = screen.getByTestId("error-msg__input-file")
        expect(errorMsg).toHaveStyle("display: none")
      })
    })

    describe("When I upload a wrong file",  () => {
      test("Then it should detect that a file has been loaded, display an error message", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))

        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

        let fileInput = screen.getByTestId("file")

        const handleChangeFile = jest.fn((e) => newBillObj.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFile)

        // Create a test file (which is not an image) and simulate file input change with the test file
        const testFile = new File(new Uint8Array(4), "testFile.txt", { type : "text/plain"})
        fireEvent.change(fileInput, {target : {files : [testFile]}})

        expect(handleChangeFile).toHaveBeenCalled()

        // Check if the error message is diplay
        const errorMsg = screen.getByTestId("error-msg__input-file")
        expect(errorMsg).toHaveStyle("display: block")
      })
    })

    describe("When I submit the form with valid data", () => {
      test("Then the form must be submitted and I will be redirected to the bills page", () => {
        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        })

        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))

        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

        // Get form elements
        const formEl = screen.getByTestId("form-new-bill")
        const expenseTypeInput = screen.getByTestId("expense-type")
        const expenseNameInput = screen.getByTestId("expense-name")
        const datepickerInput = screen.getByTestId("datepicker")
        const amountInput = screen.getByTestId("amount")
        const vatInput = screen.getByTestId("vat")
        const pctInput = screen.getByTestId("pct")
        const commentaryInput = screen.getByTestId("commentary")
        const fileInput = screen.getByTestId("file")

        const testFile = new File(new Uint8Array(4), "testFile.jpeg", { type : "image/jpeg"})

        // Simulate user input
        fireEvent.change(expenseTypeInput, {target : {value : "Fournitures de bureau"}})
        fireEvent.change(expenseNameInput, {target : {value : "Test achat fournitures"}})
        fireEvent.change(datepickerInput, {target : {value : "2004-04-04"}})
        fireEvent.change(amountInput, {target : {value : "50"}})
        fireEvent.change(vatInput, {target : {value : "12"}})
        fireEvent.change(pctInput, {target : {value : "12"}})
        fireEvent.change(commentaryInput, {target : {value : "Hello World"}})
        fireEvent.change(fileInput, {target : {files : [testFile]}})

        // Mock handleSubmit function and add event on form element
        const handleSubmit = jest.fn((e) => newBillObj.handleSubmit(e))
        formEl.addEventListener("submit", handleSubmit)
        fireEvent.submit(formEl)

        // Verify that the handleSubmit function was called
        expect(handleSubmit).toHaveBeenCalled()
        // Verify that the user is redirected to the bills page
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
      })
    })
  })
})
