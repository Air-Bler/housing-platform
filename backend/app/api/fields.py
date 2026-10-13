"""Κανόνες εγκυρότητας για τα στοιχεία ακινήτου, κοινοί για όλα τα endpoints.

Τα όρια είναι τα εύλογα όρια μιας κατοικίας προς ενοικίαση στην Αθήνα, ευθυγραμμισμένα
με τους ελέγχους της φόρμας στο frontend. Τιμές εκτός ορίων απορρίπτονται με 422 πριν
φτάσουν στο μοντέλο, αντί να παράγουν μια εκτίμηση χωρίς νόημα.
"""

from datetime import date
from typing import Annotated, Literal

from pydantic import AfterValidator, Field, StringConstraints

MIN_YEAR_BUILT = 1850


def _not_in_future(year: int) -> int:
    if year > date.today().year:
        raise ValueError(f"Το έτος κατασκευής δεν μπορεί να είναι μετά το {date.today().year}")
    return year


Suburb = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Sqm = Annotated[float, Field(gt=5, le=1000, description="Εμβαδόν σε τ.μ.")]
Bedrooms = Annotated[int, Field(ge=0, le=15, description="0 = studio")]
Bathrooms = Annotated[int, Field(ge=1, le=10)]
Floor = Annotated[int, Field(ge=-2, le=40, description="-1 = υπόγειο, 0 = ισόγειο")]
YearBuilt = Annotated[int, Field(ge=MIN_YEAR_BUILT), AfterValidator(_not_in_future)]
MetroWalkTime = Literal["auto", "under_5", "5_10", "10_15", "over_15"]
VisionScore = Annotated[float, Field(ge=1.0, le=10.0)]
MonthlyRent = Annotated[float, Field(gt=0, le=50_000)]
Condition = Literal["light", "medium", "heavy"]
Budget = Annotated[float, Field(gt=0, le=5_000_000)]
YearsVacant = Annotated[float, Field(ge=0, le=100)]
TaxRate = Annotated[float, Field(ge=0, le=0.6)]
