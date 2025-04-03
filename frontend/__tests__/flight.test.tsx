import {beforeEach, describe, expect, test, vi} from 'vitest'
import {render, screen} from "@testing-library/react"
import FlightsDetails from '@/components/flights/flights-details'

describe("FlightPage", () => {
    beforeEach(()=> {
        vi.clearAllMocks()
    })

    render(<FlightsDetails/>)
    test("renders Found", () => {
        expect(screen.getByText(/Found/i)).toBeDefined()
    })
})