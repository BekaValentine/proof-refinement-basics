module TypeChecker where

data Type = Nat | Prod Type Type | Arr Type Type
  deriving (Show,Eq)

data Program = Var String
             | Zero | Suc Program
             | Pair Program Program | Fst Type Program | Snd Type Program
             | Lam String Program | App Type Program Program
  deriving (Show)

data Judgment = HasType [(String,Type)] Program Type
  deriving (Show)

decomposeHasType :: [(String,Type)] -> Program -> Type -> Maybe [Judgment]
decomposeHasType g (Var x) a =
  case lookup x g of
    Nothing -> Nothing
    Just a2 -> if a == a2
               then Just []
               else Nothing
decomposeHasType g Zero Nat = Just []
decomposeHasType g (Suc m) Nat = Just [HasType g m Nat]
decomposeHasType g (Pair m n) (Prod a b) = Just [HasType g m a, HasType g n b]
decomposeHasType g (Fst b p) a = Just [HasType g p (Prod a b)]
decomposeHasType g (Snd a p) b = Just [HasType g p (Prod a b)]
decomposeHasType g (Lam x m) (Arr a b) = Just [HasType ((x,a):g) m b]
decomposeHasType g (App a m n) b = Just [HasType g m (Arr a b), HasType g n a]
decomposeHasType _ _ _ = Nothing

decompose :: Judgment -> Maybe [Judgment]
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
