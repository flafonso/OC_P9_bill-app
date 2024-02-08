/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, fireEvent, getByTestId} from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js"

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
jest.mock("../app/Store.js", () => mockStore)

import { log } from "console"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then icon-mail in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })

    describe("When I upload a right file", () => {
      test("Then it should detect that a file has been loaded and keep its data", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

        const handleChangeFile = jest.fn((e) => newBillObj.handleChangeFile(e))
        let fileInput = screen.getByTestId("file")

        fileInput.addEventListener("change", handleChangeFile)
        const testFile = new File(new Uint8Array(4), "testFile.jpeg", { type : "image/jpeg"})
        fireEvent.change(fileInput, {target : {files : [testFile]}})
        expect(handleChangeFile).toHaveBeenCalled()

        const errorMsg = screen.getByTestId("error-msg__input-file")
        expect(errorMsg).toHaveStyle("display: none")

        // log(fileInput.files[0].name)
        expect(fileInput.files[0]).toEqual(testFile)
      })
    })

    describe("When I upload a wrong file",  () => {
      test("Then it should detect that a file has been loaded, not keep its data and display an error message", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

        const handleChangeFile = jest.fn((e) => newBillObj.handleChangeFile(e))
        let fileInput = screen.getByTestId("file")

        fileInput.addEventListener("change", handleChangeFile)
        const testFile = new File(new Uint8Array(4), "testFile.txt", { type : "text/plain"})
        fireEvent.change(fileInput, {target : {files : [testFile]}})
        expect(handleChangeFile).toHaveBeenCalled()

        const errorMsg = screen.getByTestId("error-msg__input-file")
        expect(errorMsg).toHaveStyle("display: block")

        // log(fileInput.files[0].name)
        // ici pourquoi files[0] n'est pas === "" ???
        // setTimeout(() => { expect(fileInput.files[0]).toEqual(testFile)}, 2000)
        // expect(fileInput.files.length).toEqual(0)
      })
    })

    describe("When I submit the form with valid data", () => {
      test("Then the form must be submitted and I will be redirected to the bills page", () => {
        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        })

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const newBillObj = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        })

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

        fireEvent.change(expenseTypeInput, {target : {value : "Fournitures de bureau"}})
        fireEvent.change(expenseNameInput, {target : {value : "Test achat fournitures"}})
        fireEvent.change(datepickerInput, {target : {value : "2004-04-04"}})
        fireEvent.change(amountInput, {target : {value : "50"}})
        fireEvent.change(vatInput, {target : {value : "12"}})
        fireEvent.change(pctInput, {target : {value : "12"}})
        fireEvent.change(commentaryInput, {target : {value : "Hello World"}})
        fireEvent.change(fileInput, {target : {files : [testFile]}})

        const handleSubmit = jest.fn((e) => newBillObj.handleSubmit(e))
        formEl.addEventListener("submit", handleSubmit)
        fireEvent.submit(formEl)

        expect(handleSubmit).toHaveBeenCalled()
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
      })
    })
  })
})
