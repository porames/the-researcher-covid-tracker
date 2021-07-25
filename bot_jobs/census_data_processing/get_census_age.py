import pandas as pd

YEAR_MONTH = "6406"


URL = f"https://stat.bora.dopa.go.th/stat/statnew/connectSAPI/stat_forward.php?API=/api/statpophouse/v1/statpop/list?action=23&yymm={YEAR_MONTH}&nat=999&popst=99"



def get_provinces_age_census(province_code: int) -> pd.DataFrame:
    #df_male_female = pd.read_json(URL + f"&cc={province_code}").T
    df_male_female = pd.read_json("bangkok.json").T
    df_male_female.drop(index=["lstrLevel","lsageRcode","lsageAA","lsageTT","lsageMM","lsageYYMM","lsageSex","lageNat","lagePopSt","lstAgev0","lsAgethai","lsSumTotTot"], inplace=True)
    df = df_male_female[0] + df_male_female[1]
    df = df.reset_index(drop=True)

    return df

def filter_by_age_group(province_name: str, province_code: int,province_age_census: pd.DataFrame) -> pd.DataFrame:
    s0_20 = province_age_census[:20].sum()
    s20_60 = province_age_census[20:60].sum()
    s60_inf = province_age_census[60:].sum()
    df = pd.DataFrame(index=["<20", "20-60", ">60","total","PROV_CODE"],
                      columns=[province_name],
                      data=[s0_20, s20_60, s60_inf, province_age_census.sum(), province_code])
    return df.T

df = get_provinces_age_census(10)

print(filter_by_age_group("BANGKOK", 10, df))