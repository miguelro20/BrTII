import {beforeEach, describe, expect, test, vi} from 'vitest'
import {render, screen} from "@testing-library/react"
import FlightsPage from '@/app/flights/page'

describe("FlightPage", () => {
    beforeEach(()=> {
        vi.clearAllMocks()
    })

    render(<FlightsPage/>)
    test("renders Found", () => {
        expect(screen.getByText(/Found/i)).toBeDefined()
    })
})