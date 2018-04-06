/**
 * Office interface
 */
export interface IOffice {
    readonly id: number;
    readonly organization_id: number;
    readonly address: string;
    readonly city: string;
}