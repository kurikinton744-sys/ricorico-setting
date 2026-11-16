/* 添付Excelの設定別確率。ユーザー指定により「直撃・設定5」は0.22から0.022へ訂正済み。 */
window.RIKORIKO_DATA = {
  "version": "2026-11-17",
  "title": "L リコリス・リコイル",
  "sourceFile": "リコリコ判別 修正.xlsx",
  "sourceSheet": "設定1",
  "items": [
    {
      "id": "run0",
      "label": "駆け抜け 0G",
      "group": "zone-run",
      "kind": "binomial",
      "rates": [
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0
      ],
      "source": "設定1!C3:C8"
    },
    {
      "id": "run100",
      "label": "駆け抜け 100G",
      "group": "zone-run",
      "kind": "binomial",
      "rates": [
        0.23,
        0.25,
        0.3,
        0.35,
        0.4,
        0.45
      ],
      "source": "設定1!C10:C15"
    },
    {
      "id": "run250",
      "label": "駆け抜け 250G",
      "group": "zone-run",
      "kind": "binomial",
      "rates": [
        0.45,
        0.46,
        0.47,
        0.48,
        0.5,
        0.52
      ],
      "source": "設定1!C17:C22"
    },
    {
      "id": "run400",
      "label": "駆け抜け 400G",
      "group": "zone-run",
      "kind": "binomial",
      "rates": [
        0.109,
        0.117,
        0.145,
        0.168,
        0.195,
        0.254
      ],
      "source": "設定1!C24:C29"
    },
    {
      "id": "normal0",
      "label": "通常 0G",
      "group": "zone-normal",
      "kind": "binomial",
      "rates": [
        0.13,
        0.14,
        0.15,
        0.16,
        0.18,
        0.2
      ],
      "source": "設定1!C32:C37"
    },
    {
      "id": "normal100",
      "label": "通常 100G",
      "group": "zone-normal",
      "kind": "binomial",
      "rates": [
        0.22,
        0.24,
        0.26,
        0.3,
        0.34,
        0.38
      ],
      "source": "設定1!C39:C44"
    },
    {
      "id": "normal250",
      "label": "通常 250G",
      "group": "zone-normal",
      "kind": "binomial",
      "rates": [
        0.27,
        0.28,
        0.3,
        0.32,
        0.34,
        0.36
      ],
      "source": "設定1!C46:C51"
    },
    {
      "id": "normal400",
      "label": "通常 400G",
      "group": "zone-normal",
      "kind": "binomial",
      "rates": [
        0.109,
        0.117,
        0.145,
        0.168,
        0.195,
        0.254
      ],
      "source": "設定1!C53:C58"
    },
    {
      "id": "high0",
      "label": "上位 0G",
      "group": "zone-high",
      "kind": "binomial",
      "rates": [
        0.05,
        0.06,
        0.07,
        0.08,
        0.09,
        0.11
      ],
      "source": "設定1!C61:C66"
    },
    {
      "id": "high100",
      "label": "上位 100G",
      "group": "zone-high",
      "kind": "binomial",
      "rates": [
        0.24,
        0.26,
        0.3,
        0.34,
        0.38,
        0.42
      ],
      "source": "設定1!C68:C73"
    },
    {
      "id": "high250",
      "label": "上位 250G",
      "group": "zone-high",
      "kind": "binomial",
      "rates": [
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0
      ],
      "source": "設定1!C75:C80"
    },
    {
      "id": "high400",
      "label": "上位 400G",
      "group": "zone-high",
      "kind": "binomial",
      "rates": [
        0.109,
        0.117,
        0.145,
        0.168,
        0.195,
        0.254
      ],
      "source": "設定1!C82:C87"
    },
    {
      "id": "triggerOpp",
      "label": "OPP",
      "group": "trigger",
      "kind": "categorical",
      "rates": [
        0.942,
        0.937,
        0.927,
        0.922,
        0.907,
        0.895
      ],
      "source": "設定1!C90:C95"
    },
    {
      "id": "triggerChild",
      "label": "幼少期",
      "group": "trigger",
      "kind": "categorical",
      "rates": [
        0.05,
        0.053,
        0.061,
        0.062,
        0.071,
        0.079
      ],
      "source": "設定1!C97:C102"
    },
    {
      "id": "triggerDirect",
      "label": "直撃",
      "group": "trigger",
      "kind": "categorical",
      "rates": [
        0.009,
        0.01,
        0.012,
        0.017,
        0.022,
        0.026
      ],
      "source": "設定1!C104:C109"
    },
    {
      "id": "commonBell",
      "label": "共通ベル",
      "group": "bell",
      "kind": "bell",
      "rates": [
        0.010438413361169102,
        0.010438413361169102,
        0.010438413361169102,
        0.011415525114155252,
        0.012019230769230768,
        0.012642225031605564
      ],
      "source": "設定1!C111:C116"
    },
    {
      "id": "endUniform",
      "label": "制服デフォ",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.645,
        0.615,
        0.57,
        0.5499999999999999,
        0.47999999999999987,
        0.4549999999999999
      ],
      "source": "設定1!C119:C124"
    },
    {
      "id": "endCasual",
      "label": "私服",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.27,
        0.28,
        0.29,
        0.3,
        0.31,
        0.33
      ],
      "source": "設定1!C126:C131"
    },
    {
      "id": "endMismatch",
      "label": "制服矛盾",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.0,
        0.0,
        0.0,
        0.005,
        0.005,
        0.005
      ],
      "source": "設定1!C133:C138"
    },
    {
      "id": "endDress",
      "label": "ドレスコード",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.085,
        0.085,
        0.12,
        0.12,
        0.18,
        0.18
      ],
      "source": "設定1!C140:C145"
    },
    {
      "id": "endOshiage",
      "label": "押上の風景",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.0,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02
      ],
      "source": "設定1!C147:C152"
    },
    {
      "id": "endRobot",
      "label": "ロボ",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.0,
        0.0,
        0.0,
        0.005,
        0.005,
        0.005
      ],
      "source": "設定1!C154:C159"
    },
    {
      "id": "endHawaii",
      "label": "ハワイ",
      "group": "ending",
      "kind": "categorical",
      "rates": [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.005
      ],
      "source": "設定1!C161:C166"
    },
    {
      "id": "episode1",
      "label": "EP1",
      "group": "episode",
      "kind": "categorical",
      "rates": [
        0.41800000000000004,
        0.41800000000000004,
        0.40499999999999997,
        0.40499999999999997,
        0.38999999999999996,
        0.38999999999999996
      ],
      "source": "設定1!C169:C174"
    },
    {
      "id": "episode2",
      "label": "EP2",
      "group": "episode",
      "kind": "categorical",
      "rates": [
        0.418,
        0.418,
        0.405,
        0.405,
        0.39,
        0.39
      ],
      "source": "設定1!C176:C181"
    },
    {
      "id": "episode3",
      "label": "EP3",
      "group": "episode",
      "kind": "categorical",
      "rates": [
        0.144,
        0.144,
        0.15,
        0.15,
        0.16,
        0.16
      ],
      "source": "設定1!C183:C188"
    },
    {
      "id": "episode4",
      "label": "EP4",
      "group": "episode",
      "kind": "categorical",
      "rates": [
        0.02,
        0.02,
        0.04,
        0.04,
        0.06,
        0.06
      ],
      "source": "設定1!C190:C195"
    }
  ],
  "groups": [
    {
      "id": "zone-run",
      "label": "CZ当選：駆け抜け",
      "description": "各ゾーンの到達（試行）回数とCZ当選回数を入力。"
    },
    {
      "id": "zone-normal",
      "label": "CZ当選：通常",
      "description": "各ゾーンの到達（試行）回数とCZ当選回数を入力。"
    },
    {
      "id": "zone-high",
      "label": "CZ当選：上位",
      "description": "各ゾーンの到達（試行）回数とCZ当選回数を入力。"
    },
    {
      "id": "bell",
      "label": "共通ベル",
      "description": "総ゲーム数と共通ベル回数を入力。"
    },
    {
      "id": "trigger",
      "label": "当選時の内訳",
      "description": "観測した当選をOPP・幼少期・直撃に分類。すべての結果を集計してください。"
    },
    {
      "id": "ending",
      "label": "AT終了画面",
      "description": "出現した終了画面をすべて集計。"
    },
    {
      "id": "episode",
      "label": "エピソード",
      "description": "出現したEP1〜EP4をすべて集計。"
    }
  ]
};
