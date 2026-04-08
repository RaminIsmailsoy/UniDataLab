from typing import List, Tuple, Dict, Any
from datetime import date
import numpy as np


class TrendAnalyzer:
    def analyze_trend(self, data_points: List[Tuple[date, float]]) -> Dict[str, Any]:
        if len(data_points) < 2:
            return {"direction": "stable", "slope": 0.0, "r_squared": 0.0}

        data_points_sorted = sorted(data_points, key=lambda x: x[0])
        x = np.arange(len(data_points_sorted), dtype=float)
        y = np.array([v for _, v in data_points_sorted], dtype=float)

        # Linear regression via numpy least squares
        x_mean = x.mean()
        y_mean = y.mean()
        ss_xy = np.sum((x - x_mean) * (y - y_mean))
        ss_xx = np.sum((x - x_mean) ** 2)

        slope = float(ss_xy / ss_xx) if ss_xx != 0 else 0.0
        intercept = float(y_mean - slope * x_mean)

        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - y_mean) ** 2)
        r_squared = float(1 - ss_res / ss_tot) if ss_tot != 0 else 0.0

        if abs(slope) < 0.01:
            direction = "stable"
        elif slope > 0:
            direction = "up"
        else:
            direction = "down"

        return {"direction": direction, "slope": round(slope, 4), "r_squared": round(max(r_squared, 0.0), 4)}

    def calculate_moving_average(self, data: List[float], window: int = 3) -> List[float]:
        if len(data) < window:
            return data
        result = []
        for i in range(len(data)):
            if i < window - 1:
                result.append(round(float(np.mean(data[: i + 1])), 4))
            else:
                result.append(round(float(np.mean(data[i - window + 1 : i + 1])), 4))
        return result

    def detect_seasonality(self, data: List[float]) -> bool:
        if len(data) < 8:
            return False
        arr = np.array(data, dtype=float)
        # Simple heuristic: check if std of differences between quarters is high
        diffs = np.diff(arr)
        return bool(np.std(diffs) > np.mean(np.abs(diffs)) * 0.5)
