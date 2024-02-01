/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, fireEvent, getByTestId} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { log } from "console"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      // const dates = screen.getAllByText(/^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Fév|Mar|Avr|Mai|Jui|Jui|Aoû|Sep|Oct|Nov|Déc)\.\s\d{2}$/i).map(a => a.innerHTML)
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // log(`dates : ${dates}`)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given I am on Bills Page", () => {
  describe("When I click on the new bill button", () => {

    test("Then call onNavigate with ROUTES_PATH.Bills", () => {
      // *Given : create a Bills class
      const onNavigate = jest.fn()
      // log(`onNavigate: ${onNavigate}`)
      const billsObj = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      })

      // *When : retrieve and click on the button
      const newBillBtn = screen.getByTestId("btn-new-bill")
      fireEvent.click(newBillBtn)

      // log(`billsObj.onNavigate: ${billsObj.onNavigate}`)
      // *Then : check if you call with the right argument
      expect(billsObj.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    });
  })
})

describe("Given I am on Bills Page", () => {
  describe("When I click on IconEye Button", () => {
    test("Then it opens up the modal", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const billsObj = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      })
      
      document.body.innerHTML = BillsUI({ data: bills })
      $.fn.modal = jest.fn()

      const handleClickIconEye = jest.fn((e) => billsObj.handleClickIconEye(e))
      const icon = screen.getAllByTestId('icon-eye')
      icon[0].addEventListener('click', handleClickIconEye(icon[0]))
      fireEvent.click(icon[0])
      expect(handleClickIconEye).toHaveBeenCalled()
    });
  })
})







describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("Then it fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "employee", email: "employee@test.com" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))

      const contentTbody = screen.getByTestId('tbody')
      expect(contentTbody.children.length).toBe(4)

      const contentType = screen.getByText("Hôtel et logement")
      expect(contentType).toBeTruthy()

      const contentName = screen.getByText("test1")
      expect(contentName).toBeTruthy()

      const contentDate = screen.getByText("2003-03-03")
      expect(contentDate).toBeTruthy()

      const contentAmount = screen.getByText("200 €")
      expect(contentAmount).toBeTruthy()

      const contentStatus = screen.getByText("pending")
      expect(contentStatus).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'employee',
          email: "employee@test.com"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("Then it fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      
      test("Then it fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})