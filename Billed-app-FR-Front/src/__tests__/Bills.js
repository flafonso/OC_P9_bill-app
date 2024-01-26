/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { log } from "console"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"

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

    test("Then call onNavigate with ROUTES_PATH['NewBill']", () => {
      // *Given : create a Bills class
      const onNavigate = jest.fn()
      // log(`onNavigate: ${onNavigate}`)
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      // *When : retrieve and click on the button
      const newBillBtn = screen.getByTestId("btn-new-bill");
      fireEvent.click(newBillBtn);

      // log(`bills.onNavigate: ${bills.onNavigate}`)
      // *Then : check if you call with the right argument
      expect(bills.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });
  })
})
