module Addition where

data Nat = Zero | Suc Nat
  deriving (Show)

data Judgment = Equal Nat Nat | Plus Nat Nat Nat
  deriving (Show)

decomposeEqual :: Nat -> Nat -> Maybe [Judgment]
decomposeEqual Zero Zero = Just []
decomposeEqual (Suc x) (Suc y) = Just [Equal x y]
decomposeEqual _ _ = Nothing

decomposePlus :: Nat -> Nat -> Nat -> Maybe [Judgment]
decomposePlus Zero y z = Just [Equal y z]
decomposePlus (Suc x) y (Suc z) = Just [Plus x y z]
decomposePlus _ _ _ = Nothing

decompose :: Judgment -> Maybe [Judgment]
decompose (Equal x y) = decomposeEqual x y
decompose (Plus x y z) = decomposePlus x y z

data ProofTree = ProofTree Judgment [ProofTree]
  deriving (Show)

findProof :: Judgment -> Maybe ProofTree
findProof j =
  case decompose j of
    Nothing -> Nothing
    Just js -> case sequence (map findProof js) of
      Nothing -> Nothing
      Just ts -> Just (ProofTree j ts)
