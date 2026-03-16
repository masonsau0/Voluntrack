import { render, screen } from "@testing-library/react"
import LocationMapPreview from "@/components/LocationMapPreview"
import { useJsApiLoader } from "@react-google-maps/api"

jest.mock("@react-google-maps/api", () => ({
    useJsApiLoader: jest.fn(),
    GoogleMap: ({ children, center, zoom }: { children?: React.ReactNode; center: { lat: number; lng: number }; zoom: number }) => (
        <div
            data-testid="google-map"
            data-lat={center?.lat}
            data-lng={center?.lng}
            data-zoom={zoom}
        >
            {children}
        </div>
    ),
    Marker: ({ position, title }: { position: { lat: number; lng: number }; title?: string }) => (
        <div
            data-testid="google-marker"
            data-lat={position?.lat}
            data-lng={position?.lng}
            data-title={title}
        />
    ),
}))

const defaultProps = {
    lat: 43.6532,
    lng: -79.3832,
    displayName: "123 King St W, Toronto, Ontario, Canada",
    isValid: true,
}

describe("LocationMapPreview", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("loading state", () => {
        it("does not render the map when Google Maps JS API is not yet loaded", () => {
            ;(useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: false })
            render(<LocationMapPreview {...defaultProps} />)
            expect(screen.queryByTestId("google-map")).not.toBeInTheDocument()
        })

        it("renders a spinner container when not loaded", () => {
            ;(useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: false })
            const { container } = render(<LocationMapPreview {...defaultProps} />)
            expect(container.querySelector(".animate-spin")).toBeInTheDocument()
        })
    })

    describe("loaded state", () => {
        beforeEach(() => {
            ;(useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true })
        })

        it("renders GoogleMap when loaded", () => {
            render(<LocationMapPreview {...defaultProps} />)
            expect(screen.getByTestId("google-map")).toBeInTheDocument()
        })

        it("centers the map on the provided coordinates", () => {
            render(<LocationMapPreview {...defaultProps} />)
            const map = screen.getByTestId("google-map")
            expect(map).toHaveAttribute("data-lat", "43.6532")
            expect(map).toHaveAttribute("data-lng", "-79.3832")
        })

        it("renders a Marker at the provided coordinates", () => {
            render(<LocationMapPreview {...defaultProps} />)
            const marker = screen.getByTestId("google-marker")
            expect(marker).toHaveAttribute("data-lat", "43.6532")
            expect(marker).toHaveAttribute("data-lng", "-79.3832")
        })

        it("passes displayName as the marker title", () => {
            render(<LocationMapPreview {...defaultProps} />)
            expect(screen.getByTestId("google-marker")).toHaveAttribute(
                "data-title",
                "123 King St W, Toronto, Ontario, Canada"
            )
        })

        it("uses zoom level 14", () => {
            render(<LocationMapPreview {...defaultProps} />)
            expect(screen.getByTestId("google-map")).toHaveAttribute("data-zoom", "14")
        })
    })

    describe("Ontario validation banner", () => {
        beforeEach(() => {
            ;(useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true })
        })

        it("does not show the warning banner when isValid is true", () => {
            render(<LocationMapPreview {...defaultProps} isValid={true} />)
            expect(screen.queryByText(/not in ontario/i)).not.toBeInTheDocument()
        })

        it("shows the warning banner when isValid is false", () => {
            render(<LocationMapPreview {...defaultProps} isValid={false} />)
            expect(screen.getByText(/not in ontario/i)).toBeInTheDocument()
        })

        it("banner text mentions Ontario and directs user to use an Ontario address", () => {
            render(<LocationMapPreview {...defaultProps} isValid={false} />)
            expect(screen.getByText(/please use an ontario address/i)).toBeInTheDocument()
        })
    })

    describe("API key", () => {
        it("initializes with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", () => {
            ;(useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true })
            render(<LocationMapPreview {...defaultProps} />)
            expect(useJsApiLoader).toHaveBeenCalledWith(
                expect.objectContaining({
                    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
                })
            )
        })
    })
})
