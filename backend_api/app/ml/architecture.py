import torch
import torch.nn as nn
import timm

class CNNBackbone(nn.Module):
    def __init__(self, name):
        super().__init__()
        self.backbone = timm.create_model(name, pretrained=False, num_classes=0)
        self.head = nn.Sequential(nn.Dropout(0.3),
                                  nn.Linear(self.backbone.num_features, 1))

    def forward(self, x):
        return self.backbone(x)

    @property
    def num_features(self):
        return self.backbone.num_features

class ViTBackbone(nn.Module):
    def __init__(self, name):
        super().__init__()
        self.backbone = timm.create_model(name, pretrained=False, num_classes=0)
        self.head = nn.Sequential(nn.Dropout(0.3),
                                  nn.Linear(self.backbone.num_features, 1))

    def forward(self, x):
        return self.backbone(x)

    @property
    def num_features(self):
        return self.backbone.num_features

class HybridModel(nn.Module):
    def __init__(self, cnn_name='efficientnet_b0', vit_name='vit_base_patch16_224', hidden=512, dropout=0.4):
        super().__init__()
        self.cnn_backbone = CNNBackbone(cnn_name)
        self.vit_backbone = ViTBackbone(vit_name)

        cnn_dim   = self.cnn_backbone.num_features
        vit_dim   = self.vit_backbone.num_features
        fused_dim = cnn_dim + vit_dim

        self.attn_gate = nn.Sequential(
            nn.Linear(fused_dim, fused_dim),
            nn.Sigmoid()
        )

        self.classifier = nn.Sequential(
            nn.LayerNorm(fused_dim),
            nn.Dropout(dropout),
            nn.Linear(fused_dim, hidden),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden, 1)
        )

        self.cnn_dim   = cnn_dim
        self.vit_dim   = vit_dim
        self.fused_dim = fused_dim

    def forward(self, x, return_features=False):
        f_cnn     = self.cnn_backbone(x)
        f_vit     = self.vit_backbone(x)
        fused     = torch.cat([f_cnn, f_vit], dim=-1)
        attn      = self.attn_gate(fused)
        fused_mod = fused * attn
        logit     = self.classifier(fused_mod)
        if return_features:
            return logit, f_cnn, f_vit, attn
        return logit