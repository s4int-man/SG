/** Ответ GET /api/lan. */
export interface LanAddressesResponse {
    addresses: string[];
    preferred: string | null;
}
