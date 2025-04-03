import {beforeEach, describe, expect, test, vi} from 'vitest'
import {render, screen} from "@testing-library/react"
import FlightSearchForm from '@/components/search/search-card'

vi.mock("next/navigation", ()=> ({
    useRouter: vi.fn(()=> ({
        push: vi.fn()
    }))
}))
describe("FlightSearchForm Component", () => {
    beforeEach(()=> {
        vi.clearAllMocks()
    })


    test("renders Found", () => {
        render(<FlightSearchForm/>)
        expect(screen.getByText(/Flight Search/i)).toBeDefined()
    })
})