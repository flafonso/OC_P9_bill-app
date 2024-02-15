/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, fireEvent, } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
jest.mock("../app/Store.js", () => mockStore)

import { reverseFormatDate } from "../app/format.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then icon-window in vertical layout should be highlighted", async () => {

      // Set up localStorage and user in localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      // Create root element and render router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Navigate to bills page
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("icon-window"))

      // Check if window icon has active-icon class
      const windowIcon = screen.getByTestId("icon-window")
      expect(windowIcon).toHaveClass("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // Render Bills UI with mock bills data
      document.body.innerHTML = BillsUI({ data: bills })

      // Get all bill dates and sort them in reverse chronological order
      const dates = screen.getAllByText(/^(0?[1-9]|[12][0-9]|3[01])\s(Janv\.|Févr\.|Mars|Avr\.|Mai|Juin|Juil\.|Août|Sept\.|Oct\.|Nov\.|Déc\.)\s\d{4}$/i).map(a => a.innerHTML)
      const datesSorted = [...dates].sort((a, b) => reverseFormatDate(b) - reverseFormatDate(a))

      // Check if bill dates are in reverse chronological order
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given I am on Bills Page", () => {
  describe("When I click on the new bill button", () => {
    test("Then I will be redirected to the bills page", () => {
      // Initialize onNavigate mock function
      const onNavigate = jest.fn()

      // Initialize bills
      const billsObj = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      })

      // Get new bill button element and simulate click event on new bill button
      const newBillBtn = screen.getByTestId("btn-new-bill")
      fireEvent.click(newBillBtn)

      // Check if onNavigate was called with correct path
      expect(billsObj.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    });
  })

  describe("When I click on IconEye Button", () => {
    test("Then it opens up the modal", () => {
      // Set up onNavigate function
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      // Initialize bills
      const billsObj = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      })

      // Render Bills UI with mock bills data
      document.body.innerHTML = BillsUI({ data: bills })
      // Mock modal function
      $.fn.modal = jest.fn()

      const icon = screen.getAllByTestId("icon-eye")

      // Mock handleClickIconEye function and add event on icon element
      const handleClickIconEye = jest.fn((e) => billsObj.handleClickIconEye(e))
      icon[0].addEventListener("click", handleClickIconEye(icon[0]))

      // Simulate click event on IconEye button and check if handleClickIconEye was called
      fireEvent.click(icon[0])
      expect(handleClickIconEye).toHaveBeenCalled()
    });
  })
})

describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("Then it fetches bills from mock API GET", async () => {
      // Set local storage with user type and email
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@test.com"
      }))

      // Create a div with id root and append it to the body to be able to initialise the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Navigate to the bills page
      window.onNavigate(ROUTES_PATH.Bills)

      // Wait for the page to load
      await waitFor(() => screen.getByText("Mes notes de frais"))

      // Get the bill table element and check if it has 4 bills
      const contentTbody = screen.getByTestId("tbody")
      expect(contentTbody.children.length).toBe(4)

      // Check if the contentType, contentName, contentDate, contentAmount, and contentStatus exist
      const contentType = screen.getByText("Hôtel et logement")
      expect(contentType).toBeTruthy()
      const contentName = screen.getByText("test1")
      expect(contentName).toBeTruthy()
      const contentDate = screen.getByText("3 Mars 2003")
      expect(contentDate).toBeTruthy()
      const contentAmount = screen.getByText("200 €")
      expect(contentAmount).toBeTruthy()
      const contentStatus = screen.getByText("pending")
      expect(contentStatus).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // Spy on mockStore.bills
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee",
          email: "employee@test.com"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("Then it fetches bills from an API and fails with 404 message error", async () => {
        // Mock implementation of mockStore.bills that rejects with Error("Erreur 404")
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})

        // Navigate to ROUTES_PATH.Bills
        window.onNavigate(ROUTES_PATH.Bills)

        // Wait for the resolution of the next promise (which is rejected)
        await new Promise(process.nextTick)

        // Check if error message is displayed
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