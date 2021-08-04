export declare interface VaccinationTimeseries {
    date: string;
    total_doses: number;
    first_dose: number;
    second_dose: number;
    third_dose: number | null;
    daily_vaccinations?: number;
    missing_data?: boolean;
    data_anomaly?: string;
    deltaAvg?: number;
}


export declare interface ManufacturerDataProps {
    "date": string,
    "manufacturer": string,
    "doses_administered": number
}

export declare interface ProvincelVaccination {
    update_date: string;
    data: {
        "province": string,
        "1st_dose": {
            "AstraZeneca": number,
            "Johnson & Johnson": number,
            "Sinopharm": number,
            "Sinovac": number,
            "total_doses": number,
            ">80": number,
            "61-80": number,
            "41-60": number,
            "21-40": number,
            "18-20": number
        },
        "2nd_dose": {
            "AstraZeneca": number,
            "Johnson & Johnson": number,
            "Sinopharm": number,
            "Sinovac": number,
            "total_doses": number,
            ">80": number,
            "61-80": number,
            "41-60": number,
            "21-40": number,
            "18-20": number
        },
        "3rd_dose": {
            "AstraZeneca": number,
            "Johnson & Johnson": number,
            "Sinopharm": number,
            "Sinovac": number,
            "total_doses": number,
            ">80": number,
            "61-80": number,
            "41-60": number,
            "21-40": number,
            "18-20": number
        },
        "all_dose": {
            "AstraZeneca": number,
            "Johnson & Johnson": number,
            "Sinopharm": number,
            "Sinovac": number,
            "total_doses": number,
            ">80": number,
            "61-80": number,
            "41-60": number,
            "21-40": number,
            "18-20": number
        }
    }[]
}