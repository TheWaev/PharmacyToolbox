"""
QRISK3-2017 — 10-year cardiovascular risk.

Faithful Python port of the open-source QRISK3-2017 algorithm published by
ClinRisk Ltd under the GNU LGPL (https://qrisk.org). The two raw model
functions reproduce the published C coefficients exactly; the public wrapper
adds the same input handling as the official qrisk.org calculator:

  * BMI (derived from height + weight) is clamped to the valid 20-40 range.
  * Total:HDL cholesterol ratio is clamped to the valid 1-11 range.
  * A blank SBP standard deviation is treated as 0 (no measured variability),
    NOT the population mean.
  * Blank BMI / cholesterol ratio / systolic BP fall back to the population
    mean; a blank Townsend score falls back to 0 (approximately average).

ClinRisk disclaimer (must accompany any displayed score): this code implements
QRISK3-2017 faithfully, but it is the end user's responsibility to confirm it
reproduces the original at https://qrisk.org. Inaccurate implementations can
lead to the wrong treatment. Decision aid only — not for direct clinical use
without validation. QRISK(R) is a registered trademark of ClinRisk Ltd.

Validated to 1 decimal place against the 48 reference cases shipped with the
CRAN `QRISK3` package (original C-algorithm scores).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional

# --- Lookup labels (index into the model's arrays) --------------------------

ETHNICITIES = {
    1: "White or not stated",
    2: "Indian",
    3: "Pakistani",
    4: "Bangladeshi",
    5: "Other Asian",
    6: "Black Caribbean",
    7: "Black African",
    8: "Chinese",
    9: "Other ethnic group",
}

SMOKING = {
    0: "Non-smoker",
    1: "Ex-smoker",
    2: "Light smoker (<10/day)",
    3: "Moderate smoker (10-19/day)",
    4: "Heavy smoker (>=20/day)",
}

# --- Population means used to centre the continuous variables ---------------

_MEAN = {
    "female": {
        "bmi": 10 / math.sqrt(0.154946178197861),
        "rati": 3.476326465606690,
        "sbp": 123.130012512207030,
        "sbps5": 9.002537727355957,
    },
    "male": {
        "bmi": 10 / math.sqrt(0.149176135659218),
        "rati": 4.300998687744141,
        "sbp": 128.571578979492190,
        "sbps5": 8.756621360778809,
    },
}

# qrisk.org's valid input ranges — values outside are substituted with the
# boundary before the model runs (e.g. a BMI of 18.2 is calculated with 20).
BMI_MIN, BMI_MAX = 20.0, 40.0
CHOL_RATIO_MIN, CHOL_RATIO_MAX = 1.0, 11.0


@dataclass
class RawInput:
    """Model-ready inputs (continuous variables un-centred; flags as 0/1)."""

    age: float
    b_AF: int
    b_atypicalantipsy: int
    b_corticosteroids: int
    b_impotence2: int
    b_migraine: int
    b_ra: int
    b_renal: int
    b_semi: int
    b_sle: int
    b_treatedhyp: int
    b_type1: int
    b_type2: int
    bmi: float
    ethrisk: int
    fh_cvd: int
    rati: float
    sbp: float
    sbps5: float
    smoke_cat: int
    town: float


def cvd_female_raw(i: RawInput) -> float:
    """Faithful port of cvd_female_raw (QRISK3-2017, ClinRisk LGPL)."""
    survivor10 = 0.988876402378082
    Iethrisk = [
        0, 0,
        0.2804031433299542500000000,
        0.5629899414207539800000000,
        0.2959000085111651600000000,
        0.0727853798779825450000000,
        -0.1707213550885731700000000,
        -0.3937104331487497100000000,
        -0.3263249528353027200000000,
        -0.1712705688324178400000000,
    ]
    Ismoke = [
        0,
        0.1338683378654626200000000,
        0.5620085801243853700000000,
        0.6674959337750254700000000,
        0.8494817764483084700000000,
    ]

    dage = i.age / 10
    age_1 = dage ** -2
    age_2 = dage
    dbmi = i.bmi / 10
    bmi_1 = dbmi ** -2
    bmi_2 = (dbmi ** -2) * math.log(dbmi)

    age_1 -= 0.053274843841791
    age_2 -= 4.332503318786621
    bmi_1 -= 0.154946178197861
    bmi_2 -= 0.144462317228317
    rati = i.rati - 3.476326465606690
    sbp = i.sbp - 123.130012512207030
    sbps5 = i.sbps5 - 9.002537727355957
    town = i.town - 0.392308831214905

    a = 0.0
    a += Iethrisk[i.ethrisk]
    a += Ismoke[i.smoke_cat]

    a += age_1 * -8.1388109247726188000000000
    a += age_2 * 0.7973337668969909800000000
    a += bmi_1 * 0.2923609227546005200000000
    a += bmi_2 * -4.1513300213837665000000000
    a += rati * 0.1533803582080255400000000
    a += sbp * 0.0131314884071034240000000
    a += sbps5 * 0.0078894541014586095000000
    a += town * 0.0772237905885901080000000

    a += i.b_AF * 1.5923354969269663000000000
    a += i.b_atypicalantipsy * 0.2523764207011555700000000
    a += i.b_corticosteroids * 0.5952072530460185100000000
    a += i.b_migraine * 0.3012672608703450000000000
    a += i.b_ra * 0.2136480343518194200000000
    a += i.b_renal * 0.6519456949384583300000000
    a += i.b_semi * 0.1255530805882017800000000
    a += i.b_sle * 0.7588093865426769300000000
    a += i.b_treatedhyp * 0.5093159368342300400000000
    a += i.b_type1 * 1.7267977510537347000000000
    a += i.b_type2 * 1.0688773244615468000000000
    a += i.fh_cvd * 0.4544531902089621300000000

    a += age_1 * (1 if i.smoke_cat == 1 else 0) * -4.7057161785851891000000000
    a += age_1 * (1 if i.smoke_cat == 2 else 0) * -2.7430383403573337000000000
    a += age_1 * (1 if i.smoke_cat == 3 else 0) * -0.8660808882939218200000000
    a += age_1 * (1 if i.smoke_cat == 4 else 0) * 0.9024156236971064800000000
    a += age_1 * i.b_AF * 19.9380348895465610000000000
    a += age_1 * i.b_corticosteroids * -0.9840804523593628100000000
    a += age_1 * i.b_migraine * 1.7634979587872999000000000
    a += age_1 * i.b_renal * -3.5874047731694114000000000
    a += age_1 * i.b_sle * 19.6903037386382920000000000
    a += age_1 * i.b_treatedhyp * 11.8728097339218120000000000
    a += age_1 * i.b_type1 * -1.2444332714320747000000000
    a += age_1 * i.b_type2 * 6.8652342000009599000000000
    a += age_1 * bmi_1 * 23.8026234121417420000000000
    a += age_1 * bmi_2 * -71.1849476920870070000000000
    a += age_1 * i.fh_cvd * 0.9946780794043512700000000
    a += age_1 * sbp * 0.0341318423386154850000000
    a += age_1 * town * -1.0301180802035639000000000
    a += age_2 * (1 if i.smoke_cat == 1 else 0) * -0.0755892446431930260000000
    a += age_2 * (1 if i.smoke_cat == 2 else 0) * -0.1195119287486707400000000
    a += age_2 * (1 if i.smoke_cat == 3 else 0) * -0.1036630639757192300000000
    a += age_2 * (1 if i.smoke_cat == 4 else 0) * -0.1399185359171838900000000
    a += age_2 * i.b_AF * -0.0761826510111625050000000
    a += age_2 * i.b_corticosteroids * -0.1200536494674247200000000
    a += age_2 * i.b_migraine * -0.0655869178986998590000000
    a += age_2 * i.b_renal * -0.2268887308644250700000000
    a += age_2 * i.b_sle * 0.0773479496790162730000000
    a += age_2 * i.b_treatedhyp * 0.0009685782358817443600000
    a += age_2 * i.b_type1 * -0.2872406462448894900000000
    a += age_2 * i.b_type2 * -0.0971122525906954890000000
    a += age_2 * bmi_1 * 0.5236995893366442900000000
    a += age_2 * bmi_2 * 0.0457441901223237590000000
    a += age_2 * i.fh_cvd * -0.0768850516984230380000000
    a += age_2 * sbp * -0.0015082501423272358000000
    a += age_2 * town * -0.0315934146749623290000000

    return 100.0 * (1 - survivor10 ** math.exp(a))


def cvd_male_raw(i: RawInput) -> float:
    """Faithful port of cvd_male_raw (QRISK3-2017, ClinRisk LGPL)."""
    survivor10 = 0.977268040180206
    Iethrisk = [
        0, 0,
        0.2771924876030827900000000,
        0.4744636071493126800000000,
        0.5296172991968937100000000,
        0.0351001591862990170000000,
        -0.3580789966932791900000000,
        -0.4005648523216514000000000,
        -0.4152279288983017300000000,
        -0.2632134813474996700000000,
    ]
    Ismoke = [
        0,
        0.1912822286338898300000000,
        0.5524158819264555200000000,
        0.6383505302750607200000000,
        0.7898381988185801900000000,
    ]

    dage = i.age / 10
    age_1 = dage ** -1
    age_2 = dage ** 3
    dbmi = i.bmi / 10
    bmi_2 = (dbmi ** -2) * math.log(dbmi)
    bmi_1 = dbmi ** -2

    age_1 -= 0.234766781330109
    age_2 -= 77.284080505371094
    bmi_1 -= 0.149176135659218
    bmi_2 -= 0.141913309693336
    rati = i.rati - 4.300998687744141
    sbp = i.sbp - 128.571578979492190
    sbps5 = i.sbps5 - 8.756621360778809
    town = i.town - 0.526304900646210

    a = 0.0
    a += Iethrisk[i.ethrisk]
    a += Ismoke[i.smoke_cat]

    a += age_1 * -17.8397816660055750000000000
    a += age_2 * 0.0022964880605765492000000
    a += bmi_1 * 2.4562776660536358000000000
    a += bmi_2 * -8.3011122314711354000000000
    a += rati * 0.1734019685632711100000000
    a += sbp * 0.0129101265425533050000000
    a += sbps5 * 0.0102519142912904560000000
    a += town * 0.0332682012772872950000000

    a += i.b_AF * 0.8820923692805465700000000
    a += i.b_atypicalantipsy * 0.1304687985517351300000000
    a += i.b_corticosteroids * 0.4548539975044554300000000
    a += i.b_impotence2 * 0.2225185908670538300000000
    a += i.b_migraine * 0.2558417807415991300000000
    a += i.b_ra * 0.2097065801395656700000000
    a += i.b_renal * 0.7185326128827438400000000
    a += i.b_semi * 0.1213303988204716400000000
    a += i.b_sle * 0.4401572174457522000000000
    a += i.b_treatedhyp * 0.5165987108269547400000000
    a += i.b_type1 * 1.2343425521675175000000000
    a += i.b_type2 * 0.8594207143093222100000000
    a += i.fh_cvd * 0.5405546900939015600000000

    a += age_1 * (1 if i.smoke_cat == 1 else 0) * -0.2101113393351634600000000
    a += age_1 * (1 if i.smoke_cat == 2 else 0) * 0.7526867644750319100000000
    a += age_1 * (1 if i.smoke_cat == 3 else 0) * 0.9931588755640579100000000
    a += age_1 * (1 if i.smoke_cat == 4 else 0) * 2.1331163414389076000000000
    a += age_1 * i.b_AF * 3.4896675530623207000000000
    a += age_1 * i.b_corticosteroids * 1.1708133653489108000000000
    a += age_1 * i.b_impotence2 * -1.5064009857454310000000000
    a += age_1 * i.b_migraine * 2.3491159871402441000000000
    a += age_1 * i.b_renal * -0.5065671632722369400000000
    a += age_1 * i.b_treatedhyp * 6.5114581098532671000000000
    a += age_1 * i.b_type1 * 5.3379864878006531000000000
    a += age_1 * i.b_type2 * 3.6461817406221311000000000
    a += age_1 * bmi_1 * 31.0049529560338860000000000
    a += age_1 * bmi_2 * -111.2915718439164300000000000
    a += age_1 * i.fh_cvd * 2.7808628508531887000000000
    a += age_1 * sbp * 0.0188585244698658530000000
    a += age_1 * town * -0.1007554870063731000000000
    a += age_2 * (1 if i.smoke_cat == 1 else 0) * -0.0004985487027532612100000
    a += age_2 * (1 if i.smoke_cat == 2 else 0) * -0.0007987563331738541400000
    a += age_2 * (1 if i.smoke_cat == 3 else 0) * -0.0008370618426625129600000
    a += age_2 * (1 if i.smoke_cat == 4 else 0) * -0.0007840031915563728900000
    a += age_2 * i.b_AF * -0.0003499560834063604900000
    a += age_2 * i.b_corticosteroids * -0.0002496045095297166000000
    a += age_2 * i.b_impotence2 * -0.0011058218441227373000000
    a += age_2 * i.b_migraine * 0.0001989644604147863100000
    a += age_2 * i.b_renal * -0.0018325930166498813000000
    a += age_2 * i.b_treatedhyp * 0.0006383805310416501300000
    a += age_2 * i.b_type1 * 0.0006409780808752897000000
    a += age_2 * i.b_type2 * -0.0002469569558886831500000
    a += age_2 * bmi_1 * 0.0050380102356322029000000
    a += age_2 * bmi_2 * -0.0130744830025243190000000
    a += age_2 * i.fh_cvd * -0.0002479180990739603700000
    a += age_2 * sbp * -0.0000127187419158845700000
    a += age_2 * town * -0.0000932996423232728880000

    return 100.0 * (1 - survivor10 ** math.exp(a))


# --- Public, UI-facing wrapper ----------------------------------------------


@dataclass
class Qrisk3Input:
    """Patient inputs. Continuous fields may be None to use the population
    average; height/weight are used to derive BMI."""

    sex: str  # "female" | "male"
    age: Optional[float]  # 25-84
    ethnicity: int = 1  # 1-9
    smoking: int = 0  # 0-4
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    chol_ratio: Optional[float] = None  # total:HDL ratio
    sbp: Optional[float] = None  # mean systolic BP
    sbp_sd: Optional[float] = None  # SD of >=2 systolic readings
    townsend: Optional[float] = None  # deprivation score; None -> 0 (~average)
    af: bool = False
    atypical_antipsychotic: bool = False
    corticosteroids: bool = False
    erectile_dysfunction: bool = False  # males only
    migraine: bool = False
    rheumatoid_arthritis: bool = False
    ckd: bool = False  # CKD stage 3, 4 or 5
    severe_mental_illness: bool = False
    sle: bool = False
    treated_hypertension: bool = False
    type1_diabetes: bool = False
    type2_diabetes: bool = False
    family_history_cvd: bool = False  # angina/MI in 1st-degree relative <60


@dataclass
class Qrisk3Result:
    ok: bool
    errors: list = field(default_factory=list)
    score: Optional[float] = None  # 10-year CVD risk (%), 1 dp
    bmi: Optional[float] = None  # actual BMI from height+weight
    bmi_used: Optional[float] = None  # BMI fed to the model (clamped 20-40)
    chol_ratio_used: Optional[float] = None  # ratio fed to the model (clamped 1-11)
    statin_threshold_met: Optional[bool] = None  # NICE NG238: >=10%


def _clamp(n: float, lo: float, hi: float) -> float:
    return min(max(n, lo), hi)


def _derive_bmi(inp: Qrisk3Input) -> Optional[float]:
    if inp.height_cm and inp.weight_kg and inp.height_cm > 0:
        return inp.weight_kg / (inp.height_cm / 100) ** 2
    return None


def _build_raw(inp: Qrisk3Input) -> RawInput:
    m = _MEAN[inp.sex]
    bmi_derived = _derive_bmi(inp)
    # Match qrisk.org: clamp a supplied BMI to 20-40; blank -> population mean.
    bmi_model = _clamp(bmi_derived, BMI_MIN, BMI_MAX) if bmi_derived is not None else m["bmi"]
    # Likewise clamp a supplied cholesterol ratio to 1-11; blank -> mean.
    rati_model = (
        _clamp(inp.chol_ratio, CHOL_RATIO_MIN, CHOL_RATIO_MAX)
        if inp.chol_ratio is not None
        else m["rati"]
    )

    def flag(v: bool) -> int:
        return 1 if v else 0

    return RawInput(
        age=inp.age,
        b_AF=flag(inp.af),
        b_atypicalantipsy=flag(inp.atypical_antipsychotic),
        b_corticosteroids=flag(inp.corticosteroids),
        b_impotence2=flag(inp.erectile_dysfunction) if inp.sex == "male" else 0,
        b_migraine=flag(inp.migraine),
        b_ra=flag(inp.rheumatoid_arthritis),
        b_renal=flag(inp.ckd),
        b_semi=flag(inp.severe_mental_illness),
        b_sle=flag(inp.sle),
        b_treatedhyp=flag(inp.treated_hypertension),
        b_type1=flag(inp.type1_diabetes),
        b_type2=flag(inp.type2_diabetes),
        bmi=bmi_model,
        ethrisk=inp.ethnicity,
        fh_cvd=flag(inp.family_history_cvd),
        rati=rati_model,
        sbp=inp.sbp if inp.sbp is not None else m["sbp"],
        # A blank SBP standard deviation means "no measured variability" (0),
        # NOT the population mean. Matches the official calculator.
        sbps5=inp.sbp_sd if inp.sbp_sd is not None else 0.0,
        smoke_cat=inp.smoking,
        town=inp.townsend if inp.townsend is not None else 0.0,
    )


def qrisk3(inp: Qrisk3Input) -> Qrisk3Result:
    """Compute the 10-year QRISK3 CVD risk (%), rounded to 1 decimal place."""
    errors: list = []
    if inp.age is None:
        errors.append("Enter the patient's age.")
    elif inp.age < 25 or inp.age > 84:
        errors.append("QRISK3 is only valid for ages 25-84.")
    if not inp.ethnicity:
        errors.append("Select an ethnicity.")

    if errors:
        return Qrisk3Result(ok=False, errors=errors)

    raw = _build_raw(inp)
    raw_score = cvd_female_raw(raw) if inp.sex == "female" else cvd_male_raw(raw)
    score = round(raw_score, 1)

    return Qrisk3Result(
        ok=True,
        errors=[],
        score=score,
        bmi=_derive_bmi(inp),
        bmi_used=raw.bmi,
        chol_ratio_used=raw.rati,
        statin_threshold_met=score >= 10,
    )


if __name__ == "__main__":
    # Two known qrisk.org cases (no postcode / deprivation = average).
    female = qrisk3(Qrisk3Input(
        sex="female", age=56, ethnicity=1, smoking=2,
        height_cm=166, weight_kg=84, chol_ratio=1.9, sbp=140,
        af=True, treated_hypertension=True,
    ))
    male = qrisk3(Qrisk3Input(
        sex="male", age=67, ethnicity=1, smoking=0,
        height_cm=189, weight_kg=65, chol_ratio=1.9, sbp=140, af=True,
    ))
    print(f"Female case: {female.score}%  (qrisk.org = 17.8%)")
    print(f"Male case:   {male.score}%  (qrisk.org = 18.1%; "
          f"BMI {male.bmi:.1f} -> {male.bmi_used:.0f} substituted)")
