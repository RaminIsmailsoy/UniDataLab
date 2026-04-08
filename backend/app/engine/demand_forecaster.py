from typing import List, Dict, Any, Optional
import numpy as np

try:
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class DemandForecaster:
    def __init__(self):
        self._model: Optional[Any] = None
        self._specializations: List[str] = []
        self._trained = False

    def train(self, historical_data: List[Dict[str, Any]]) -> None:
        """Train on historical_data: list of {year, demand_score, specialization}."""
        if not historical_data or not SKLEARN_AVAILABLE:
            return

        X = np.array([[row["year"]] for row in historical_data], dtype=float)
        y = np.array([row["demand_score"] for row in historical_data], dtype=float)
        self._specializations = list({row.get("specialization", "") for row in historical_data})

        self._model = LinearRegression()
        self._model.fit(X, y)
        self._trained = True

    def predict(self, specialization: str, years_ahead: int = 3) -> List[Dict[str, Any]]:
        """Predict demand for the next years_ahead years."""
        if not self._trained or self._model is None:
            base = 50.0
            current_year = 2024
            return [
                {"year": current_year + i + 1, "predicted_demand": round(base + i * 2.5, 2)}
                for i in range(years_ahead)
            ]

        current_year = 2024
        results = []
        for i in range(1, years_ahead + 1):
            year = current_year + i
            pred = float(self._model.predict(np.array([[year]]))[0])
            pred = max(0.0, min(100.0, pred))
            results.append({"year": year, "predicted_demand": round(pred, 2)})
        return results

    def get_feature_importance(self) -> Dict[str, Any]:
        if not self._trained or self._model is None:
            return {"features": [], "importances": []}
        return {
            "features": ["year"],
            "importances": [round(float(self._model.coef_[0]), 4)],
            "intercept": round(float(self._model.intercept_), 4),
        }
