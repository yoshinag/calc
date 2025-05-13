// dot_viewer_templates.js
const templates = {
    dot_simple_digraph: {
        name: "DOT: シンプルな有向グラフ",
        type: "dot",
        code: `digraph SimpleGraph {
  A -> B;
  B -> C;
  C -> A;
  B -> D;
  D -> C;
}`
    },
    dot_undirected_graph: {
        name: "DOT: シンプルな無向グラフ",
        type: "dot",
        code: `graph SimpleGraph {
  A -- B;
  B -- C;
  C -- A;
  B -- D;
  D -- C;
}`
    },
    dot_custom_nodes: {
        name: "DOT: カスタムノード",
        type: "dot",
        code: `digraph CustomNodes {
  node [shape=box, style=filled, color=skyblue];
  A [label="Start Here"];
  B [shape=ellipse, color=lightgreen];
  C [shape=diamond, color=salmon];
  D;

  A -> B;
  B -> C;
  B -> D;
  C -> D;
}`
    },
    dot_clusters: {
        name: "DOT: クラスタ",
        type: "dot",
        code: `digraph Clusters {
  subgraph cluster_0 {
    style=filled;
    color=lightgrey;
    node [style=filled,color=white];
    a0 -> a1 -> a2 -> a3;
    label = "Process A";
  }

  subgraph cluster_1 {
    node [style=filled];
    b0 -> b1 -> b2 -> b3;
    label = "Process B";
    color=blue;
  }
  start -> a0;
  start -> b0;
  a1 -> b3;
  b2 -> a3;
  a3 -> end;
  b3 -> end;

  start [shape=Mdiamond];
  end [shape=Msquare];
}`
    },
    mermaid_flowchart_lr: {
        name: "Mermaid: フローチャート (左->右)",
        type: "mermaid",
        code: `graph LR
    A[開始] --> B{判定};
    B -- Yes --> C[処理1];
    B -- No --> D[処理2];
    C --> E[終了];
    D --> E;`
    },
    mermaid_flowchart_td: {
        name: "Mermaid: フローチャート (上->下)",
        type: "mermaid",
        code: `graph TD
    A[クリスマス] -- ごちそう --> B(七面鳥);
    A -- プレゼント --> C(おもちゃ);
    B --> D{食べる?};
    C --> D;
    D -- Yes --> E[おいしい！];
    D -- No --> F[サンタさん悲しい];`
    },
    mermaid_sequence: {
        name: "Mermaid: シーケンス図",
        type: "mermaid",
        code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts<br/>prevail...
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`
    },
    mermaid_class: {
        name: "Mermaid: クラス図",
        type: "mermaid",
        code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }`
    },
    mermaid_gantt: {
        name: "Mermaid: ガントチャート",
        type: "mermaid",
        code: `gantt
    title プロジェクトタイムライン
    dateFormat  YYYY-MM-DD
    section 設計フェーズ
    設計タスク1           :a1, 2024-01-01, 30d
    設計タスク2           :after a1  , 20d
    section 開発フェーズ
    開発タスク1           :2024-02-15  , 40d
    開発タスク2           :2024-02-20, 50d`
    },
    mermaid_pie: {
        name: "Mermaid: 円グラフ",
        type: "mermaid",
        code: `pie title 果物の割合
    "リンゴ" : 386
    "バナナ" : 250
    "オレンジ" : 245
    "ブドウ" : 210`
    },
    mermaid_gitgraph: {
        name: "Mermaid: Gitグラフ",
        type: "mermaid",
        code: `gitGraph
   commit id: "เริ่มต้น"
   branch feature-A
   commit id: "A1"
   commit id: "A2"
   checkout main
   commit id: "M1"
   merge feature-A id: "merge-A"
   branch feature-B
   commit id: "B1"
   checkout main
   commit id: "M2"
   checkout feature-B
   commit id: "B2"
   checkout main
   merge feature-B id: "merge-B"
   commit id: "สิ้นสุด"`
    }
};