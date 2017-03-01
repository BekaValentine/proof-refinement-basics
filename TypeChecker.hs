module TypeChecker where

data Type = Nat | Prod Type Type | Arr Type Type
  deriving (Show)

data Program = Var String
             | Pair Program Program | Fst Type Program | Snd Type Program
             | Lam String Program | App Type Program Program
  deriving (Show)

data Judgment = Equal Type Type | HasType [(String,Type)] Program Type
  deriving (Show)

decomposeEqual :: Type -> Type -> Maybe [Judgment]
decomposeEqual Nat Nat = Just []
decomposeEqual (Prod a1 b1) (Prod a2 b2) = Just [Equal a1 a2, Equal b1 b2]
decomposeEqual (Arr a1 b1) (Arr a2 b2) = Just [Equal a1 a2, Equal b1 b2]
decomposeEqual _ _ = Nothing

decomposeHasType :: [(String,Type)] -> Program -> Type -> Maybe [Judgment]
decomposeHasType g (Var x) a =
  case lookup x g of
    Nothing -> Nothing
    Just a2 -> Just [Equal a a2]
decomposeHasType g (Pair m n) (Prod a b) = Just [HasType g m a, HasType g n b]
decomposeHasType g (Fst b p) a = Just [HasType g p (Prod a b)]
decomposeHasType g (Snd a p) b = Just [HasType g p (Prod a b)]
decomposeHasType g (Lam x m) (Arr a b) = Just [HasType ((x,a):g) m b]
decomposeHasType g (App a m n) b = Just [HasType g m (Arr a b), HasType g n a]
decomposeHasType _ _ _ = Nothing

decompose :: Judgment -> Maybe [Judgment]
decompose (Equal a b) = decomposeEqual a b
decompose (HasType g m a) = decomposeHasType g m a

data ProofTree = ProofTree Judgment [ProofTree]
  deriving (Show)

findProof :: Judgment -> Maybe ProofTree
findProof j =
  case decompose j of
    Nothing -> Nothing
    Just js -> case sequence (map findProof js) of
      Nothing -> Nothing
      Just ts -> Just (ProofTree j ts)
